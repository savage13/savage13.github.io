function rot_animate(can, angle, duration) {
    var start = null;
    var a0 = can.angle * 180.0 / Math.PI;
    
    function rot(timestamp) {
        if (!start) {
            start = timestamp;
        }
        var progress = (timestamp - start) / duration;
        can.rotate((a0 + angle * progress/100.0) * Math.PI/180.0);
        if(progress < 100.0) {
            window.requestAnimationFrame(rot);
        } else {
        }
    }
    window.requestAnimationFrame(rot);
}
function show_answer_p51() {
    //var adipd = 298 ;
    //var adipv = 20;
    var strike = 67;
    var adipd = 90.0;
    var adipv = 33;
    var strike = 131;
    var dip = 45;
    setTimeout(function run(i) {
        var wait_duration = 1000;
        if(i == 0) {
            c51.add( new Plane( {type: "pole", color: "black", strike: adipd, dip: adipv} ) )
        } else if ( i == 1) {
            c51.add( new Plane( {type: "pole", color: "red", strike: strike, dip: "0"} ) );
            //c51.add( new Plane( {type: "pole", color: "red", strike: strike+180, dip: "0"} ) );
        } else if ( i == 2 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c51, -strike, animation_duration);
            wait_duration += 1000;
        } else if ( i == 3 ) {
            c51.add(  new Plane ( {type: "plane", color: "magenta", strike: strike+180, dip: dip }) );
        } else if ( i == 4 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c51, +strike, animation_duration);
            c51.rotate(0.0);
            wait_duration += 1000;
        }
        setTimeout(run, wait_duration, i+1);
    }, 1000, 0);
    //setTimeout(show_answer_p51(), 3000);
}
function show_answer_p52() {
    var adipd1 = 335;
    var adipv1 = 35;
    var adipd2 = 220;
    var adipv2 = 19;
    var strike = 200;
    var dip = 45;
    setTimeout(function run(i) {
        var wait_duration = 1000;
        if(i == 0) {
            c52.add ( new Plane( {type: "pole", color: "black", strike: adipd1, dip: adipv1} ) );
        } else if ( i == 1) {
            c52.add ( new Plane( {type: "pole", color: "red", strike: adipd2, dip: adipv2} ) );
        } else if ( i == 2 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c52, 360-strike, animation_duration);
            wait_duration += 1000;
        } else if ( i == 3 ) {
            c52.add(  new Plane ( {type: "plane", color: "fuchsia", strike: 200, dip: 45 }) );
        } else if ( i == 4 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c52, -360+strike, animation_duration);
            c52.rotate(0.0);
            wait_duration += 1000;
        }
        if(i<10) {
            setTimeout(run, wait_duration, i+1);
        }

    }, 1000, 0);
}
function show_answer_p54() {
    var s1 = 30;
    var s2 = 80+180;
    var d1 = 35;
    var d2 = 75;
    var p = 25
    var t = 72;
    setTimeout(function run(i) {
        var wait_duration = 1000;
        if(i == 0) {
            c54.add ( new Plane( {type: "plane", color: "black", strike: s1, dip: d1} ) );
        } else if(i == 1) {
            c54.add ( new Plane( {type: "plane", color: "red", strike: s2, dip: d2} ) );
        } else if ( i == 2) {
            c54.add(  new Plane ( {type: "pole", color: "fuchsia", strike: t, dip: p }) );
        } else if ( i == 3 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c54, 90-t, animation_duration);
            wait_duration += 1000;
        } else if ( i == 4 ) {
            c54.add(  new Plane ( {type: "pole", color: "orange", strike: t, dip: 0 }) );
        } else if ( i == 5 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c54, -(90-t), animation_duration);
            c54.rotate(0.0);
            wait_duration += 1000;
        }
        if(i<10) {
            setTimeout(run, wait_duration, i+1);
        }
    }, 1000, 0);
}
function show_answer_p54p1() {
    var s1 = 30;
    var s2 = 80+180;
    var d1 = 35;
    var d2 = 75;
    var p = 25
    var t = 72;
    setTimeout(function run(i) {
        var wait_duration = 1000;
        if(i == 0) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c54, -s1, animation_duration);
            wait_duration += 1000;
        } else if ( i == 2 ) {
            var d2r = Math.PI / 180.0;
            var r2d = 1.0 / d2r;
            var id = null;
            setTimeout(function plungy(j) {
                if(id !== null) {
                    c54.remove(id);
                }
                var t2 = s1 + Math.asin( Math.tan(j * d2r) / Math.tan(d1 * d2r) ) * r2d;
                id = c54.add(  new Plane ( {type: "pole", color: "blue", strike: t2, dip: j }) );
                if(j < p) {
                    setTimeout(plungy, 200, j + p/5.0);
                }
            }, 200, 0.0)
            wait_duration += 1000;
        } else if ( i == 5 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c54, s1, animation_duration);
            c54.rotate(0.0);
            wait_duration += 1000;
        }
        if(i<10) {
            setTimeout(run, wait_duration, i+1);
        }
        
    }, 1000, 0);
}
function show_answer_p54p2() {
    var s1 = 30;
    var s2 = 80+180;
    var d1 = 35;
    var d2 = 75;
    var p = 25
    var t = 72;
    setTimeout(function run(i) {
        var wait_duration = 1000;
        if(i == 0) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c54, -(s2-180), animation_duration);
            wait_duration += 1000;
        } else if ( i == 2 ) {
            var d2r = Math.PI / 180.0;
            var r2d = 1.0 / d2r;
            var id = null;
            setTimeout(function plungy(j) {
                if(id !== null) {
                    c54.remove(id);
                }
                var t2 = (s2 - 180) - Math.asin( Math.tan(j * d2r) / Math.tan(d2 * d2r) ) * r2d;
                id = c54.add(  new Plane ( {type: "pole", color: "blue", strike: t2, dip: j }) );
                if(j < p) {
                    setTimeout(plungy, 200, j + p/5.0);
                }
            }, 200, 0.0)
            wait_duration += 1000;
        } else if ( i == 5 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c54, (s2-180), animation_duration);
            c54.rotate(0.0);
            wait_duration += 1000;
        }
        if(i<10) {
            setTimeout(run, wait_duration, i+1);
        }
        
    }, 1000, 0);
}

function pole_to_lat_lon(net, trend, plunge) {

    var d2r = Math.PI / 180.0;
    var angle = trend * d2r;
    var r = plunge / 90.0 * net.radius;
    var r = Math.sqrt(1.0 - (r * r));
    
}

function show_answer_p58() {
    var s1 = 45;
    var d1 = 20;
    var s2 = 235-180
    var d2 = 60;
    var p1 = null;
    var p2 = null;
    setTimeout(function run(i) {
        var wait_duration = 1000;
        var p2t = null;
        if(i == 0) {
            p1 = c58.add ( new Plane( {type: "plane", color: "black", strike: s1, dip: d1} ) );
        } else if(i == 1) {
            p2 = c58.add ( new Plane( {type: "plane", color: "red", strike: s2, dip: d2} ) );
        } else if ( i == 2) {
            c58.change_plane_type(p1);
        } else if ( i == 3) {
            c58.change_plane_type(p2);
        } else if ( i == 4) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c58, -s1, animation_duration);
            wait_duration += 1000;
        } else if ( i == 5 ) {
            var ddip = (90 - (90-d1)) / 5.0;
            //c58.add( new Plane( {type: "pole", color: "black", strike: s1-90, dip: 90-d1} ) );
            var p1t = c58.add( new Plane( {type: "pole", color: "gray", strike: s1-90, dip: 90-d1} ) );
            p2t = c58.add( new Plane( {type: "pole", color: "fuchsia", strike: s2-90, dip: 90-d2} ) );
            setTimeout(function untilt(v,v1) {
                c58.remove(p1t);
                c58.remove(p2t);
                var sd1 = rotate_along_small_circle(s1, 0.0, s1-90, 90-d1, -v);
                var sd2 = rotate_along_small_circle(s1, 0.0, s2-90, 90-d2, -v);
                //document.getElementById("p58debug").innerHTML += v.toFixed(4) + " " + ddip.toFixed(4) + " " + v1.toFixed(4) + "<br/>";
                p1t = c58.add(  new Plane ( {type: "pole", color: "gray", strike: sd1[0], dip: sd1[1] }) );
                p2t = c58.add(  new Plane ( {type: "pole", color: "fuchsia", strike: sd2[0], dip: sd2[1] }) );
                if(v < v1) {
                    setTimeout(untilt, wait_duration/15.0, v + ddip, v1);
                }
            }, 200, 0.0, d1);
            wait_duration += 1000;
        } else if ( i == 6 ) {
            var animation_duration = 10.0; // milliseconds
            rot_animate(c58, s1, animation_duration);
            c54.rotate(0.0);
            wait_duration *= 2;
        } else if (i == 7 ) {
            var sd2 = rotate_along_small_circle(s1, 0.0, s2-90, 90-d2, -d1);
            c58.add(  new Plane ( {type: "pole", color: "fuchsia", strike: sd2[0], dip: sd2[1] }) );
            var blah = c58.add(  new Plane ( {type: "pole", color: "fuchsia", strike: sd2[0], dip: sd2[1] }) );
            c58.change_plane_type(blah);
        }
        if(i<10) {
            setTimeout(run, wait_duration, i+1);
        }
    }, 1000, 0);
}

function radians(x) {
    //alert("radians: " + x );
    //alert("radians: " + (x*Math.PI/180.0) );
    return x * Math.PI / 180.0;
}
function degrees(x) {
    return x * 180.0 / Math.PI;
}
function ZeroTwoPi(a) {
    // ZeroTwoPi constrains azimuth to lie between 0 and 2*pi radians %
    // b = ZeroTwoPi(a) returns azimuth b (from 0 to 2*pi)
    // for input azimuth a (which may not be between 0 to 2*pi) %
    // NOTE: Azimuths a and b are input/output in radians

    var b=a;
    var twopi = 2.0*Math.PI;
    if(b < 0.0) {
        b = b + twopi;
    } else if(b >= twopi) {
        b = b- twopi;
    }
    return b;
}

function SphToCart(trd,plg,k) {
    // SphToCart converts from spherical to cartesian coordinates %
    // [cn,ce,cd] = SphToCart(trd,plg,k) returns the north (cn),
    // east (ce), and down (cd) direction cosines of a line. %
    // k is an integer to tell whether the trend and plunge of a line
    // (k = 0) or strike and dip of a plane in right hand rule
    // (k = 1) are being sent in the trd and plg slots. In this
    // last case, the direction cosines of the pole to the plane
    // are returned

    // NOTE: Angles should be entered in radians
    var cd = 0.0;
    var ce = 0.0;
    var cn = 0.0;
    // If line (see Table 2.1)
    if(k == 0) {
        cd = Math.sin(plg);
        ce = Math.cos(plg) * Math.sin(trd);
        cn = Math.cos(plg) * Math.cos(trd);
        //Else pole to plane (see Table 2.1)
    }  else if(k == 1) {
        cd = Math.cos(plg);
        ce = -Math.sin(plg) * Math.cos(trd);
        cn = Math.sin(plg) * Math.sin(trd);
    }
    return [cn,ce,cd]
}
function CartToSph(cn,ce,cd) {
    // CartToSph Converts from cartesian to spherical coordinates %
    // [trd,plg] = CartToSph(cn,ce,cd) returns the trend (trd)
    // and plunge (plg) of a line for input north (cn), east (ce),
    // and down (cd) direction cosines

    // NOTE: Trend and plunge are returned in radians %
    // CartToSph uses function ZeroTwoPi

    // Plunge (see Table2.1)
    plg = Math.asin(cd);
    // Trend
    // If north direction cosine is zero, trend is east or west
    // Choose which one by the sign of the east direction cosine
    if(cn == 0.0) {
        if(ce < 0.0) {
            trd = 3.0/2.0*Math.PI; // trend is west
        } else {
            trd = Math.PI/2.0; // trend is east
        }
        // Else use Table2.1
    } else {
        trd = Math.atan(ce/cn);
        if(cn < 0.0) {
            // Add pi
            trd = trd+pi;
            // Make sure trd is between 0 and 2*pi
        }
        trd = ZeroTwoPi(trd);
    }
    return [trd,plg];
}

function Rotate(raz,rdip,rot,trd,plg, ans0) {

    // Rotate rotates a line by performing a coordinate transformation on
    // vectors. The algorithm was originally written by Randall A. Marrett
    // USE: [rtrd,rplg] = Rotate(raz,rdip,rot,trd,plg,ans0)

    // raz  =  trend of rotation axis
    // rdip  = plunge of rotation axis
    // rot   = magnitude of rotation
    // trd   = trend of the vector to be rotated
    // plg   = plunge of the vector to be rotated
    // ans0  = A character indicating whether the line to be rotated is an axis
    // (ans0 = 'a') or a vector (ans0 = 'v') %
    // NOTE: All angles are in radians

    // Rotate uses functions SphToCart and CartToSph
    // 
    // Allocate some arrays
    //a     = np.zeros((3,3)) // Transformation matrix
    // pole  = np.zeros((3)) // Direction cosines of rotation axis
    //plotr = np.zeros((3)) // Direction cosines of rotated vector
    // temp  = np.zeros((3)) // Direction cosines of unrotated vector

    // Convert rotation axis to direction cosines.
    // Note that the convention here
    //   is X1 = North, X2 = East, X3 = Down
    //alert("az, dip: " + raz + " " + rdip);
    //alert("rot: " + rot);
    var pole = SphToCart(raz,rdip,0)
    //alert("pole : " + pole);
    var a = [[0.,0.,0.],
             [0.,0.,0.],
             [0.,0.,0.]];
    // Calculate the transformation matrix
    var x = 1.0 - Math.cos(rot);
    var sinRot = Math.sin(rot); // Just reduces the number of calculations
    var cosRot = Math.cos(rot);
    a[0][0] =          cosRot + pole[0]*pole[0]*x
    a[0][1] = -pole[2]*sinRot + pole[0]*pole[1]*x
    a[0][2] =  pole[1]*sinRot + pole[0]*pole[2]*x

    a[1][0] =  pole[2]*sinRot + pole[1]*pole[0]*x
    a[1][1] =          cosRot + pole[1]*pole[1]*x
    a[1][2] = -pole[0]*sinRot + pole[1]*pole[2]*x

    a[2][0] = -pole[1]*sinRot + pole[2]*pole[0]*x
    a[2][1] =  pole[0]*sinRot + pole[2]*pole[1]*x
    a[2][2] =          cosRot + pole[2]*pole[2]*x
    //alert("a: "+ a);
    // Convert trend and plunge of vector to be rotated into direction cosines
    var temp = SphToCart(trd,plg,0);
    //alert("temp: " + temp);
    // The following nested loops perform the coordinate transformation
    var plotr = [0.0, 0.0, 0.0]
    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 3; j++) {
            plotr[i] += a[i][j]*temp[j];
        }
    }
    //alert("plotr: " + plotr);
    // Convert to lower hemisphere projection if data are axes (ans0 = 'a')
    if(plotr[2] < 0.0 && ans0 == 'a') {
        for(var i = 0; i < 3; i++) {
            plotr[i] = -plotr[i];
        }
    }

    // Convert from direction cosines back to trend and plunge
    [rtrd,rplg] = CartToSph(plotr[0],plotr[1],plotr[2])
    return [rtrd, rplg]
}
function rotate_along_small_circle(ax_trend, az_plunge, trend, plunge, angle) {
    // alert(trend + " " + plunge + " " + radians(angle));
    var tp = Rotate(radians(ax_trend), radians(az_plunge), radians(angle),
                    radians(trend), radians(plunge), 'v')
    // alert(degrees(tp[0]) + " " + degrees(tp[1]));
    return [degrees(tp[0]), degrees(tp[1])]
}

var c51 = new Stereonet("#c51");
var c52 = new Stereonet("#c52");
var c54 = new Stereonet("#c54");
var c58 = new Stereonet("#c58");

