function apply_defaults( defaults, input ) {
    for (key in defaults) {
        input[key] = (typeof input[key] == 'undefined') ? defaults[key] : input[key];
    }
    return input;

}

function plane_undefined(obj) {
    if( obj.strike == NaN ||
        obj.dip    == NaN ||
        obj.strike == undefined ||
        obj.dip    == undefined ||
  ! (obj.strike >= -180 && obj.strike <= 360 &&
           obj.dip >= 0 && obj.dip <= 90)) {
  return true;
    }
    return false;
}

var Style = function(obj) {
    var def = {
        width: 2,
        color:'black',
    };
    obj = apply_defaults(def, obj);
    this.width   = obj.width;
    this.color   = obj.color;

    this.stroke = function(net) {
        net.cx.strokeStyle = colorNameToHex(this.color);
        net.cx.lineWidth   = this.width;
    }
    this.fill = function(net) {
        net.cx.fillStyle   = colorNameToHex(this.color);
    }
    this.text = function() {
        return this.color;
    }
}


var SmallCircle = function(obj) {
    var def = {
        rotation: undefined,
        angle:    undefined,
        type:     'smallcircle',
    };
    this.error = 1;
    // Parse if data is available
    if(obj.data != undefined) {
        obj.type = obj.data[0];
        if(obj.type != 'smallcircle') {
            return;
        }
        obj.angle    = parseFloat( obj.data[1] );
        obj.rotation = parseFloat( obj.data[2] );
        obj.color    = obj.data[3];
    }
    // Fill up with missing values
    obj = apply_defaults(def, obj);

    if(obj.rotation == undefined || obj.angle == undefined) {
        return;
    }

    this.style = new Style( obj );
    this.rotation = obj.rotation;
    this.angle    = obj.angle;
    this.type     = obj.type;

    this.draw = function(net) {
        angle = (this.angle < 0.0) ? -90.0 - this.angle : 90 - this.angle;
        net.cx.save();
        this.style.stroke(net);
        net.cx.rotate(this.rotation * Math.PI/180.0);
        net.small_circle(angle);
        net.cx.restore();
    }
    this.change_color = function(color) {
        this.style.color = color;
    }
    this.text = function() {
        return( 'smallcircle ' +
                this.angle + ' ' +
                this.rotation + ' ' +
                this.style.text() );
    }
    this.error = 0;
}

var Plane = function( obj ) {
    var strike, dip, type, color;
    var def = {
        strike: undefined,
        dip:    undefined,
        type:   "plane",
        color:  "black"
    };

    this.error = 1;
    if(obj.input != undefined) {
        obj.type = obj.input;
    }
    if(obj.data != undefined) {
        obj.type = obj.data[0];
        obj.color = obj.data[3];
        if(obj.type != "plane" && obj.type != "pole") {
            return;
        }
        obj.strike = geo_direction_to_number(parse_direction( obj.data[1] ));
        obj.dip = parse_direction( obj.data[2] );
        if(obj.type == "plane") {
            var z = dip_apply(obj.strike, obj.dip);
            obj.strike = z[0];
            obj.dip    = z[1];
        } else if(obj.type == "pole" && obj.dip[0] == "" && obj.dip[2] == "") {
            obj.dip = obj.dip[1] * 1.0;
            obj.strike = obj.strike * 1.0;
        }
    }

    obj = apply_defaults(def, obj);
    if( plane_undefined( obj ) ) {
        if(obj.type == "pole" && obj.dip > 90 && obj.strike !== undefined) {
            obj.dip = 180.0 - obj.dip
            obj.strike = zero_360(obj.strike + 180)
        } else {
            console.log("plane undefined: ", obj)
            return;
        }
    }
    this.strike  = obj.strike * 1.0;
    this.dip     = obj.dip * 1.0;
    if(this.dip > 90) {
        //console.log(`dip > 90 strike: ${this.strike} dip: ${this.dip}`)
        this.dip = 90 - dip
        this.strike = zero_360(this.strike + 180)
        //console.log(`dip > 90 strike: ${this.strike} dip: ${this.dip}`)
    }
    this.sstrike = obj.strike * 1.0; // Show Strike
    this.sdip    = obj.dip * 1.0; // Show Strike
    this.type    = obj.type;
    this.style   = new Style(obj);

    this.pole_draw = function(net) {
        var z;
        var size  = net.pole_size;
        net.cx.save();
        net.cx.rotate((this.sstrike + 180) * (Math.PI / 180.0) );
        net.cx.beginPath();
        this.style.fill(net);
        if(this.type == "plane") {
            z = net.project(0.0, this.dip);
        } else {
            z = net.project(0.0, 90 - this.dip);
        }
        net.cx.arc(net.radius * z.x, net.radius * z.y, size, 0, 2.0 * Math.PI, 1);
        net.cx.fill();
        net.cx.restore();
    }
    this.plane_draw = function(net) {
        var width = net.plane_width;
        net.cx.save();
        net.cx.rotate(this.sstrike * Math.PI / 180.0);
        this.style.stroke(net)
        if(this.type == "plane") {
            net.great_circle(90 - this.dip);
        } else {
            net.great_circle(this.dip);
        }
        net.cx.restore();
    }

    this.change_type = function() {
        if(this.draw == this.plane_draw) {
            this.draw = this.pole_draw;
        } else {
            this.draw = this.plane_draw;
        }
    }
    this.change_color = function(color) {
        this.style.color = color;
    }
    this.text = function() {
        return( this.type + ' ' +
                this.strike + ' ' +
                this.dip + ' ' +
                this.style.text() );
    }


    if(this.type == "pole") {
        this.draw  = this.pole_draw;
        this.sstrike += 90;
    } else {
        this.draw = this.plane_draw;
    }
    this.error = 0;
}

function parsePlane(line) {

    var strike = dip = type = color = -1;
    var obj, error;
    // Remove leading and trailing spaces
    line = line.replace(/ +$/, "");
    line = line.replace(/^ +/, "");

    error = "error: (" + line + ") ==> ";

    // Split on Space(s)
    v = line.replace(/ +/, ' ').split(" ");

    // Input must have 4 items (strike, dip, type, color)
    if(v.length == 4) {
        // Convert Strike to 0-360 Value after parsing
        if(v[0] == "smallcircle") {
            obj = new SmallCircle({ data: v });
        } else {
            obj = new Plane({ data: v});
        }
        if(obj == undefined || obj.error) {
            obj = { error:  error + " skipping, ill-formed values" };
        }
    } else if(v.length == 2 && v[0] == 'angle') {
        angle = parseFloat(v[1]);
        if(!isNaN(angle)) {
            obj = { type: 'angle', angle: angle };
        } else {
            obj = {error: error + ' skipping, ill-formed value for angle' };
        }
    } else {
        obj = { error: error + " expected (type, strike, dip, color)" + v };
    }
    return obj;
}

function parse_direction( s ) {
    var val, start, end;
    start = end = "";
    if(s.search(/[a-zA-Z]/) == -1) { // No Letter, Only Numbers
        val = s * 1.0;
    } else {
        var i = s.search(/[a-zA-Z]/);  // First Letter
        var j = s.search(/[0-9]/);     // First Number
        if(i == 0) {  // Number is First, remove it
            var start = s.substr(i, j); // Grab Letters
            s = s.substr(j);          // Remove Letter
            i = s.search(/[a-zA-Z]/); // Find next letter
        }
        if(i == -1) {
            i = s.length;
        }
        var val = s.substr(0,i); // Grab Number
        var end = s.substr(i);   // Grab Letters at the end
        out = "(" + start + ") " + val + " (" + end + ")";
    }
    return [start, val, end];
}

function geo_direction_to_number( v ) {
    var out = 0;
    if(v[0] == "" && v[2] == "") {  out = v[1] * 1.0;  }
    else if(v[0] == "" || v[2] == "") {  out = -1;          }
    else {
             if(v[0] == "N") {
             if(v[2] == "E") {  out = 0.0   + v[1]*1.0;  }
        else if(v[2] == "W") {  out = 360.0 - v[1]*1.0;  }
      } else if(v[0] == "S") {
             if(v[2] == "E") {  out = 180.0 - v[1]*1.0;  }
        else if(v[2] == "W") {  out = 180.0 + v[1]*1.0;  }
      }
    }
    return out;
}

function to180(x) {
    while(x > 180) { x -= 360; }
    while(x < -180) { x += 360; }
    return x;
}
function to360(x) {
    while(x > 360) { x -= 360; }
    while(x < 0) { x += 360; }
    return x;
}

function dip_apply( s, d ) {
    s1 = to180(s);
    switch(d[2]) {
    case '':
        return [to360(s), d[1] *1.0];
        break;
    case 'N':
        if( (s1 > -45 && s1 < 45) || (s > 135 && s < 225 ) ) { return [-1,-1]; }
        if( s >= 225 && s <= 315 ) {
            s2 = s;
        }
        if( s >= 45 && s <= 135) {
            s2 = s + 180;
        }
        s2 = to360(s2);
        return [s2, d[1] * 1.0]
        break;
    case 'S':
        if( (s1 > -45 && s1 < 45) || (s > 135 && s < 225 ) ) { return [-1,-1]; }
        s2 = to360(s);
        return [s2, d[1] * 1.0]
        break;
    case 'E':
        if( (s > 45 && s < 135) || (s > 225 && s < 315 ) ) { return [-1,-1]; }
        s2 = to360(s);
        return [s2, d[1] * 1.0]
        break;
    case 'W':
        if( (s > 45 && s < 135) || (s > 225 && s < 315 ) ) { return [-1,-1]; }
        s2 = to360(s + 180.0);
        return [s2, d[1] * 1.0]
        break;
    case 'NW':
        if( (s > 270 && s < 360) || (s > 90 && s < 180 ) ) { return [-1,-1]; }
        s2 = to360(s + 180.0);
        return [s2, d[1] * 1.0]
        break;
    case 'SE':
        if( (s > 270 && s < 360) || (s > 90 && s < 180 ) ) { return [-1,-1]; }
        s2 = to360(s);
        return [s2, d[1] * 1.0]
        break;
    case 'NE':
        if( (s > 0 && s < 90) || (s > 180 && s < 270 ) ) { return [-1,-1]; }
        s2 = to360(s);
        return [s2, d[1] * 1.0]
        break;
    case 'SW':
        if( (s > 0 && s < 90) || (s > 180 && s < 270 ) ) { return [-1,-1]; }
        s2 = to360(s);
        return [s2, d[1] * 1.0]
        break;
    }
    return [-1,-1];
}

function zero_360(v) {
    while(v < 0.0) {
        v += 360.0
    }
    while(v > 360.0) {
        v -= 360.0
    }
    return v
}

function cosd(v) {
    return Math.cos(v * Math.PI / 180.0)
}
function sind(v) {
    return Math.sin(v * Math.PI / 180.0)
}
function tand(v) {
    return Math.tan(v * Math.PI / 180.0)
}
function asind(v) {
    return Math.asin(v) * 180.0 / Math.PI
}
function atand(v) {
    return Math.atan(v) * 180.0 / Math.PI
}

// T = S+b = S+(arctan(tanR*cosD))
// P = arcsin(sinD*sinR)
function Pitch(strike, dip, pitch, color) {
    const beta = atand( tand(pitch) * cosd(dip))
    const trend = strike + beta
    const plunge = asind( sind(dip) * sind(pitch))
    //console.log(strike, dip, pitch, trend, plunge)
    return new Plane({"type": "pole", color, strike: trend, dip: plunge})
}
