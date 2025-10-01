function debug(str) {
    $("#debug").append(str + "<br/>");
}
function debugc(str) {
    $("#debug").empty();
    debug(str);
}

function $(x) { return document.querySelector(x); }

class Stereonet extends EventTarget {

    constructor(id) {
        super()
        this.canvas = $(id);

        if(!this.canvas) {
            alert(`Error: stereonet cannot find canvas id: ${id}`);
            console.log(document.querySelector(id), id)
            return;
        }

        if(!this.canvas.getContext) {
            alert("Error: stereonet cannot find canvas.getContext");
            return;
        }

        this.cx = this.canvas.getContext("2d");
        if(!this.cx) {
            alert("Error: stereonet failed to getContext");
            return;
        }

        // Lengths
        this.x0     = -this.canvas.width/2.0;
        this.y0     = -this.canvas.height/2.0;
        this.width  =  this.canvas.width;
        this.height =  this.canvas.height;
        this.radius = (this.width/2.0) * 0.8;

        // Translate the canvas to put the middle at (0, 0)
        this.cx.translate(this.width/2.0, this.height/2.0);

        this.objects = new Array();
        this.last_id     = 0;

        this.EQUAL_AREA  = 0;
        this.EQUAL_ANGLE = 1;
        this.projection_type = this.EQUAL_AREA;

        // These are setup for a good looking stereonet
        this.segments          = 17;
        this.reference_spacing = 10;
        this.reference_width   = 0.5;
        this.reference_color   = 'rgba(0,0,0,0.5)';
        this.show_original_net = 1;

        this.pole_size  = 5;
        this.plane_width = 2;

        // Set the default to an Equal Area Net
        this.project = this.equal_area
        this.inverse = this.equal_area_inverse

        // Movement
        this.mouse_add = false;
        this.angle = 0.0;
        this.angle_start = 0.;

        //net = this;

        $(id).addEventListener('mousedown', (ev) => {  this.mousedown(ev); });
        $(id).addEventListener('mousemove', (ev) => { this.mousemove(ev); });
        $(id).addEventListener('mouseup', (ev) => { this.mouseup(ev);   });

        this.update();

    }
    on(type, listener, options = {}) {
        this.addEventListener(type, listener, options)
    }

    // Functions
    clear() {
        this.cx.clearRect(this.x0, this.y0, this.width, this.height);
        this.cx.fillStyle = "#FFFFFF";
        this.cx.fillRect(this.x0, this.y0, this.width, this.height);
        this.cx.fill();
    }

    reset() {
        this.angle = 0
        this.remove_all()
        this.update()
    }
    

    // Rotate the Steroenet and redraw
    rotate(angle) {
        //angle_show(angle);
        this.angle = angle;
        this.update();
        this.dispatchEvent(new CustomEvent('angle', { detail: { angle: this.angle * 180 / Math.PI } }))
    }

    save(id) {
        var dataurl = this.canvas.toDataURL();
        $(id).prepend('<img width="100%" src="' + dataurl + '"/> <hr/>');
        for(var pid in this.objects) {
            var p = this.objects[pid];
            $(id).prepend( p.text() + "<br/>");
        }
        $(id).prepend('angle ' + (this.angle * 180.0/Math.PI).toFixed(2) + '<br/>' );
    }

    // Draw the reference ticks
    ticks() {
        for(var i = 0; i < 4; i++) {
            this.cx.save();
            this.cx.rotate(i * Math.PI/2);
            this.cx.beginPath();
            this.cx.moveTo(0, -this.radius);
            this.cx.lineTo(0, -this.radius + 20);
            this.cx.stroke();
            this.cx.restore();
        }
    }

    // Compute an Equal Area Net
    equal_area(lat, lon) {
        var x, y, z;
        lat = lat * Math.PI / 180.0;
        lon = lon * Math.PI / 180.0;
        z = Math.cos(lat) * Math.cos(lon);
        x = (Math.cos(lat) * Math.sin(lon)) * Math.sqrt(1/(1+z));
        y = Math.sin(lat) * Math.sqrt(1/(1+z));
        return { x: x, y: y };
    }

    equal_area_inverse(r,ang) {
        var mstrike = ( ang * 180.0/Math.PI ) + 90.0;
        var r = this.mouse_radius / this.radius;
        var mdip = 1 - (r * r) ;
        mdip = Math.asin( Math.sqrt(1 - (mdip * mdip)) ) * 180.0 / Math.PI
        return { strike: mstrike, dip: 90 - mdip };
    }

    // Compute an Equal Angle Net
    equal_angle(lat, lon) {
        var x, y, z;
        lat = lat * Math.PI / 180.0;
        lon = lon * Math.PI / 180.0;
        z = Math.cos(lat) * Math.cos(lon);
        x = (Math.cos(lat) * Math.sin(lon)) / (1+z);
        y = Math.sin(lat) / (1+z);
        return { x: x, y: y };
    }

    equal_angle_inverse(r,ang) {
        var mstrike = ( ang * 180.0/Math.PI ) + 90.0;
        var r = this.mouse_radius / this.radius;
        var mdip = (Math.atan(r) * 2.0) * 180.0 / Math.PI;
        return { strike: mstrike, dip: 90 - mdip };
    }



    // Draw a small circle
    small_circle(lat) {
        var z;
        this.cx.save();
        this.cx.beginPath();
        z = this.project(lat, -90.0);
        this.cx.moveTo(this.radius * z.x, this.radius * z.y);
        for(var j = -this.segments; j <= this.segments; j++) {
            var lon = j * 90.0/this.segments;
            z = this.project(lat, lon);
            this.cx.lineTo(this.radius * z.x, this.radius * z.y);
        }
        this.cx.stroke();
        this.cx.restore();
    }

    // Draw a great cicle
    great_circle(lon) {
        var xi, yi;
        this.cx.save();
        this.cx.beginPath();
        this.cx.moveTo(0, -this.radius);
        for(var j = -this.segments; j <= this.segments; j++) {
            var lat = j * 90.0 / this.segments;
            var z = this.project(lat, lon);
            this.cx.lineTo(this.radius * z.x, this.radius * z.y);
        }
        this.cx.stroke();
        this.cx.restore();

    }


    // Draw the small and great circle refernce lines
    reference_lines() {
        for(var i = -90.0; i <= 90.0; i += this.reference_spacing) {
            this.great_circle(i);
            this.small_circle(i);
        }
    }

    // Draw a Circle
    circle() {
        this.cx.save();
        this.cx.moveTo(0, 0);
        this.cx.beginPath();
        this.cx.lineWidth = this.reference_width;
        this.cx.strokeStyle = this.reference_color;
        this.cx.arc(0, 0, this.radius, 0.0, 2.0 * Math.PI, 1);
        this.cx.stroke();
        this.cx.restore();
    }

    north_tick() {
        this.cx.lineWidth = 1.5;
        this.cx.moveTo(0, -this.radius);
        this.cx.lineTo(0, -this.radius - 20);
        this.cx.stroke();
        this.cx.lineWidth = this.reference_width;
    }

    // Draw the reference lines an the northern marker
    reference_draw() {
        this.cx.lineWidth = this.reference_width;
        this.circle();
        this.ticks();
        this.cx.strokeStyle = this.reference_color;
        this.reference_lines();
        this.north_tick();
    }

    // Drawing Function
    update() {
        this.clear();
        if(this.show_original_net) {
            this.reference_draw();
        }
        this.cx.save();
        this.cx.rotate(this.angle);
        this.north_tick();
        this.objects_draw();
        this.cx.restore();
    }

    objects_draw() {
        for(var i in this.objects) {
            this.objects[i].draw(this);
        }
    }

    range(x, min_value, max_value) {
        var dr = max_value - min_value;
        while(x >= max_value) { x -= dr; }
        while(x < min_value) { x += dr; }
        return x;
    }

    mouse_position(e) {
        var rect = this.canvas.getBoundingClientRect();
        this.mouse_x = e.pageX - rect.left + this.x0;
        this.mouse_y = e.pageY - rect.top + this.y0 ;

        this.mouse_angle = Math.atan2(this.mouse_y, this.mouse_x);
        this.mouse_radius = Math.sqrt( (this.mouse_x * this.mouse_x) +
                                       (this.mouse_y * this.mouse_y) );
    }
    mousedown(ev) {
        this.mouse_position(ev);
        if(this.mouse_add == false) {
            this.drag_started = true;
            this.angle_start       = this.angle;
            this.drag_angle_change = this.angle;
            this.drag_angle_start  = this.mouse_angle;
            this.rotate(this.angle);
        } else {
            var z;
            z = this.inverse(this.mouse_radius, this.mouse_angle - this.angle);
            z.strike = this.range(z.strike, 0, 360);
            add_plane({ input:  'pole',
                        color:  "black",
                        strike: z.strike.toFixed(2),
                        dip:    z.dip.toFixed(2)} );
        }
    }
    mousemove(ev) {
        if(this.drag_started) {
            this.mouse_position(ev);
            this.rotate(this.angle_start +
                        (this.mouse_angle - this.drag_angle_start));
        } else {
            this.mouse_position(ev);
            if(this.mouse_radius > this.radius) {
                this.mouse_radius = this.radius;
            }
            var z =  this.inverse(this.mouse_radius, this.mouse_angle);
            z.strike = this.range(z.strike, 0, 360);
            const m = $('#mouse')
            if(m) {
                m.innerHTML =  'Strike: ' + z.strike.toFixed(2) + ' ' +
                              'Dip: ' + z.dip.toFixed(2) +
                              " (" + this.mouse_x  + ", " +
                    this.mouse_y + ")" ;
            }

        }
    }
    mouseup(ev) {
        if(this.drag_started) {
            this.mousemove(ev);
            this.drag_started = false;
        }
    }


    change_projection_type() {
        if(this.project == this.EQUAL_AREA) {
            this.project = this.equal_angle;
            this.inverse = this.equal_angle_inverse;
        } else {
            this.project = this.equal_area;
            this.inverse = this.equal_area_inverse;
        }
        this.update();
    }

    change_color(id, color) {
        if(this.objects[id]) {
            this.objects[id].change_color(color);
            this.update();
        }
    }

    change_property(width, spacing, pole_size,
                                    plane_width, show_net) {
        this.reference_width   = width;
        this.reference_spacing = spacing;
        this.pole_size         = pole_size;
        this.plane_width       = plane_width;
        this.show_original_net = show_net
        this.update();
    }

    small_circle_add( color, angle, rotation ) {
        if(rotation == undefined) {
            rotation = -this.angle * 180.0 / Math.PI;
            rotation = rotation.toFixed(2) * 1.0;
        }
        var sc = new SmallCircle( {angle:    angle,
                                   rotation: rotation,
                                   color:    color } );

        var n = this.add( sc );
        return n;
    }


    small_circles_draw() {
        this.cx.save();
        this.cx.lineWidth = 2;
        for( var id in this.small_circles ) {
            var cs = this.small_circles[id];
            this.cx.save();
            this.cx.rotate(cs.rotate);
            this.small_circle(cs.angle);
            this.cx.restore();
        }
        this.cx.lineWidth = this.reference_width;
        this.cx.restore();
    }

    add( obj ) {
        if(obj == undefined) {
            return obj;
        }
        var n = "plane" + this.last_id;
        this.objects[ n ] = obj;
        this.last_id++;
        this.update();
        return n;
    }
    remove_all() {
        for(const id of Object.keys(this.objects)) {
            delete this.objects[id];
        }
        this.update();

    }
    remove(id) {
        if(this.objects[id]) {
            delete this.objects[id];
        }
        this.update();
    }
    change_plane_type(id) {
        if(this.objects[id]) {
            this.objects[id].change_type();
        }
        this.update();
    }

    overlapping_circles() {
        var z = new Array(this.width*this.height);
        for(var i = 0; i < z.length; i++) {
            z[i] = 0;
        }
        zmax = 0;
        for(var i in this.objects) {
            var obj = this.objects[i];
            // This needs to be fixed -----
            var strike = 90.0 - (obj.sstrike - 90);
            var dip = obj.dip;
            if (obj.type == "pole") {
                dip = 90 - dip;
            }
            var q = net.project(0.0, dip);
            var r = q.x;
            var yc = Math.round(net.radius * r * Math.sin(strike * Math.PI/180.0));
            var xc = Math.round(net.radius * r * Math.cos(strike * Math.PI/180.0));
            // Translate the Point from the Center of the Stereonet
            xc = xc + this.width/2;
            yc = this.height/2 - yc;
            // Set radius to 10% of stereonet radius, 1% of the Area
            var radius = net.radius * 0.1;
            var s = Math.round(radius * 1.1);
            for(var x = -s; x < s; x++) {
                for(var y = -s; y < s; y++) {
                    if(Math.sqrt(x*x + y*y) <= radius) {
                        var offset = (((y + yc) * this.width) + (x+xc)) ;
                        z[offset]++;
                        if(z[offset] > zmax) {
                            zmax = z[offset];
                        }
                    }
                }
            }
        }
        return ({ 'data': z, 'max': zmax });
    }

    moving_circles () {
        var z = new Array(this.width*this.height);
        for(var i = 0; i < z.length; i++) {
            z[i] = 0;
        }
        zmax = 0;
        for( x = 0; x < this.width; x++) {
            for(y = 0; y < this.width; y++) {
                var offset = (y * this.width) + x ;
                for( var i in this.objects ) {
                    var obj = this.objects[i];
                    var q = net.project(0.0, dip);
                    var r = q.x;
                    var yc = Math.round(net.radius * r * Math.sin(strike * Math.PI/180.0));
                    var xc = Math.round(net.radius * r * Math.cos(strike * Math.PI/180.0));
                    // Translate the Point from the Center of the Stereonet
                    xc = xc + this.width/2;
                    yc = this.height/2 - yc;
                    if(Math.sqrt((x-xc)*(x-xc) + (y-yc)*(y-yc)) < net.radius * 0.1) {
                        z[i]++;
                    }
                }
                if(z[i] > zmax) {
                    zmax = z[i];
                }
            }
        }
        return ({ 'data': z, 'max': zmax });
    }

    contour() {
        var img;
        if(this.cx.getImageData) {
            img = this.cx.getImageData(0,0,this.width, this.height);
        } else if(this.cx.createImageData) {
            img = this.cx.getImageData(this.width, this.height);
        } else {
            img = {
                'width': this.width,
                'height': this.height,
                'data': new Array(this.width*this.height*4)
            };
        }
        z = this.overlapping_circles();
        //z = this.moving_circles();
        var cs = new Colorscale();

        var pix = img.data;
        for(var i = 0; i < z.data.length; i++) {
            if(z.data[i] > 0) {
                var j = i * 4;
                c = cs.get(z.data[i] / z.max);
                pix[j]   = c.r;
                pix[j+1] = c.g;
                pix[j+2] = c.b;
                pix[j+3] = c.a;
            }
        }

        if(this.cx.putImageData)  {
            this.cx.putImageData(img, 0, 0);
        } else {
            debug("putImageData not available");
        }
    }


}
