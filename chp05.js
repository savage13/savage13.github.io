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
    return;
    var s1 = 45;
    var d1 = 20;
    var s2 = 235-180
    var d2 = 60;
    var p1 = null;
    var p2 = null;
    setTimeout(function run(i) {
        var wait_duration = 1000;
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
            var p1t = c58.add( new Plane( {type: "pole", color: "orange", strike: s1-90, dip: 90-d1} ) );
            var p2t = c58.add( new Plane( {type: "pole", color: "purple", strike: s2-90, dip: 90-d2} ) );
            setTimeout(function untilt(v,v1,v0) {
                c58.remove(p1t);
                c58.remove(p2t);
                p1t = c58.add(  new Plane ( {type: "pole", color: "orange", strike: s1-90, dip: v }) );
                p2t = c58.add(  new Plane ( {type: "pole", color: "purple", strike: s2-90, dip: v1 }) );
                if(v < v0) {
                    setTimeout(untilt, 200, v + ddip,v1);
                }
            }, 200, 90-d1, 90-d2, 90);
            wait_duration += 1000;
            // } else if ( i == 6 ) {
            //     var animation_duration = 10.0; // milliseconds
            //     rot_animate(c54, -(90-t), animation_duration);
            //     c54.rotate(0.0);
            //     wait_duration += 1000;
            // }
        }
        if(i<10) {
            setTimeout(run, wait_duration, i+1);
        }
    }, 1000, 0);
}
var c51 = new Stereonet("#c51");
var c52 = new Stereonet("#c52");
var c54 = new Stereonet("#c54");
//var c58 = new Stereonet("#c58");

