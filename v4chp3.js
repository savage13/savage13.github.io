
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

function pole_animate(can, strike, dip0, dip1, opts = {}) {
    let color = opts.color || "black"
    let delay = opts.delay || 200
    let id = null
    setTimeout(function dotty(dip) {
        if(id !== null) {
            can.remove(id)
        }
        id = can.add(new Plane({type:"pole", color, strike, dip}))
        if(dip0 < dip1) { // Increasing dip
            if(dip < dip1) {
                dip = Math.min(dip + 10, dip1)
                setTimeout(dotty, 1000/5, dip)
            }
        } else {
            if(dip > dip1) { // Decreasing dip
                dip = Math.max(dip - 10, dip1)
                setTimeout(dotty, delay, dip)
            }
        }
    }, 200, dip0)
}

function pitch_animate(can, strike, dip, pitch0, pitch1, opts = {}) {
    const color = opts.color || "black"
    const delay = opts.delay || 200
    let id = null
    setTimeout(function dotty(pitch) {
        if(id != null) {
            can.remove(id)
        }
        id = can.add(Pitch(strike, dip, pitch, color))
        if(pitch0 < pitch1) { // Increasing pitch
            if(pitch < pitch1) {
                pitch = Math.min(pitch + 10, pitch1)
                setTimeout(dotty, delay, pitch)
            }
        } else {
            if(pitch > pitch1) {
                pitch = Math.max(pitch - 10, pitch1)
                setTimeout(dotty, delay, pitch)
            }
        }
    }, 200, pitch0)
}


function show_answer_p31() {
    c31.remove_all()
    const strike = 126
    const dip = 54
    setTimeout(function run(i) {
        let wait_duration = 1000
        if(i == 0) {
            c31.add( new Plane( {type: "pole", color: "black", strike, dip: 0}))
        } else if (i == 1) {
            rot_animate(c31, -strike, 10)
            wait_duration += 1000

        } else if(i == 2) {
            pole_animate(c31, strike+90, 0, dip)
            wait_duration += 1000
        } else if(i == 3) {
            c31.add( new Plane( { type: "plane", color: "black", strike, dip}))
        }  else if(i == 4) {
            rot_animate(c31, strike, 10)
            wait_duration += 1000
        } 
        if(i < 10) {
            setTimeout(run, wait_duration, i+1);
        }
    }, 1000, 0)
}


function show_answer_p32() {
    const trend = 255
    const plunge = 34
    c32.remove_all()
    setTimeout(function run(i) {
        let wait_duration = 1000
        if(i == 0) {
            c32.add(new Plane({type:"pole", "color": "orange", strike: trend, dip: 0}))
        }
        if(i == 1) {
            rot_animate(c32, 270-255, 10)
            wait_duration += 1000
        }
        if(i == 2) {
            pole_animate(c32, trend, 0, plunge)
            wait_duration += 1000
        }
        if(i == 3) {
            rot_animate(c32, -(270-255), 10)
        }
        if(i < 10) {
            setTimeout(run, wait_duration, i+1)
        }
    }, 1000, 0)
}

function show_answer_p33() {
    const strike = 305
    const dip = 72
    c33.remove_all()
    setTimeout(function run(i) {
        let wait_duration = 1000
        if(i == 0) {
            c33.add(new Plane({type:"pole", "color": "orange", strike: strike, dip: 0}))
        }
        if(i == 1) {
            rot_animate(c33, 360-strike, 10)
            wait_duration += 1000
        }
        if(i == 2) {
            pole_animate(c33, strike - 90 - 180, 0, dip)
            wait_duration += 1700
        }
        if(i == 3) {
            c33.add(new Plane({type: "plane", "color": "purple", strike, dip}))
        }
        if(i == 4) {
            pole_animate(c33, strike - 90 - 180, dip, dip + 90)
            wait_duration += 2300
        }
        if(i == 5) {
            rot_animate(c33, -(360-strike), 10)
        }
        if(i < 10) {
            setTimeout(run, wait_duration, i+1)
        }
    }, 1000, 0)
}


function show_answer_p34() {
    const strike1 = 36;
    const dip1 = 32
    const strike2 = 89
    const dip2 = 80
    c34.remove_all()
    setTimeout(function run(i) {
        let wait_duration = 1000
        // Plane 1
        if(i == 0) {
            c34.add(new Plane({"type": "pole", "color": "red", strike: strike1, dip: 0}))
        }
        if(i == 1) {
            rot_animate(c34, -strike1, 10)
            wait_duration += 1000
        }
        if(i == 2) {
            pole_animate(c34, strike1-90, 0, dip1, {color: "red"})
            wait_duration += 2300
        }
        if(i == 3) {
            c34.add(new Plane({"type": "plane", "color": "red", strike: strike1+180, dip: dip1}))
        }
        if(i == 4) {
            rot_animate(c34, strike1, 10)
            wait_duration += 500
        }
        // Plane 2
        if(i == 5) {
            c34.add(new Plane({"type": "pole", "color": "blue", strike: strike2, dip: 0}))
        }
        if(i == 6) {
            rot_animate(c34, -strike2, 10)
            wait_duration += 500
        }
        if(i == 7) {
            pole_animate(c34, strike2+90, 0, dip2, {color: "blue"})
            wait_duration += 1300
        }
        if(i == 8) {
            c34.add(new Plane({"type": "plane", "color": "blue", strike: strike2, dip: dip2}))
        }
        if(i == 9) {
            rot_animate(c34, strike2, 10)
            wait_duration += 500
        }
        // Intersection
        if(i == 10) {
            c34.add(new Plane({"type": "pole", "color": "fuchsia", strike: 265, dip: 25}))
        }
        if(i == 11) {
            rot_animate(c34, (270-265), 10)
        }
        if(i == 12) {
            c34.add(new Plane({"type": "pole", "color": "fuchsia", strike: 265, dip: 0}))
        }
        if(i == 13) {
            pole_animate(c34, 265, 0, 25, {color: "fuchsia"})
            wait_duration += 1300
        }
        if(i == 14) {
            rot_animate(c34, -(270-265), 10)
        }
        if(i < 20) {
            setTimeout(run, wait_duration, i+1)
        }
    }, 1000, 0)
}

function show_answer_p35() {
    const strike = 165
    const dip = 50
    const pitch = 45
    c35.remove_all()
    setTimeout(function run(i) {
        let wait_duration = 1000
        if(i == 0) {
            c35.add( new Plane({"type": "pole", "color": "black", strike, dip: 0}))
        }
        if(i == 1) {
            rot_animate(c35, -strike, 10)
            wait_duration += 800
        }
        if(i == 2) {
            pole_animate(c35, strike-90, 0, dip)
            wait_duration += 2300
        }
        if(i == 3) {
            c35.add( new Plane({"type": "plane", "color": "black", strike: strike+180, dip: dip}))
        }
        if(i == 4) {
            rot_animate(c35, strike, 10)
            wait_duration += 800
        }
        if(i == 5) {
            rot_animate(c35, -strike, 10)
            wait_duration += 800
        }
        if(i == 6) {
            pitch_animate(c35, strike, dip, 180, 180-pitch, { color: "red" } )
            wait_duration += 2300
        }
        if(i == 7) {
            // 132, 32.79
            rot_animate(c35, strike - 132 + 90, 10)
            wait_duration += 800
        }
        if(i == 8) {
            // 132, 32.79
            c35.add( new Plane({"type": "pole", "color": "red", strike: 132, dip: 0}))
        }
        if(i == 9) {
            // 132, 32.79
            pole_animate(c35, 132, 0, 32, { color: "red" })
            wait_duration += 2300
        }
        if(i == 10) {
            rot_animate(c35, strike - 132 , 10)
            wait_duration += 800
        }
        if(i < 12) {
            setTimeout(run, wait_duration, i+1)
        }

    }, 1000, 0)
}

const c31 = new Stereonet("#c31")
const c32 = new Stereonet("#c32")
const c33 = new Stereonet("#c33")
const c34 = new Stereonet("#c34")
const c35 = new Stereonet("#c35")

