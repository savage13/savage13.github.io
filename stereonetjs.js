
import { pole_rotate, Pole } from './math.js'

/*
let c = undefined

let QuickJS
export async function netjs_init() {
    QuickJS = await getQuickJS()
}

export function net_set(net) {
    c = net
}

function func(vm, name, f) {
    let h = vm.newFunction(name, f)
    vm.setProp(vm.global, name, h)
    h.dispose()
}


let wait = false

function init() {
    let vm = QuickJS.newContext()

    const logHandle = vm.newFunction("log", (...args) => {
        const nativeArgs = args.map(vm.dump).map(v => {
            if(isObject(v)) {
                return JSON.stringify(v)
            }
            return v
        })
        $('#out').textContent += nativeArgs.join(" ") + "\n"
    })
    // Partially implement `console` object
    const consoleHandle = vm.newObject()
    vm.setProp(consoleHandle, "log", logHandle)
    vm.setProp(vm.global, "console", consoleHandle)
    consoleHandle.dispose()
    logHandle.dispose()

    func(vm, "plane", (...targs) => {
        wait = true
        let args = targs.map(vm.dump)
        let p = asPlane(args)
        if(p === undefined)
            return
        run_one(0, {type:"plane", strike: p.strike, dip: p.dip})
        //addPlane(p.strike, p.dip, color)
    })
    func(vm, "pole", (...input) => {
        wait = true
        let args = input.map(vm.dump)
        let [trend, plunge] = [0, 0]
        if(isPole(args[0])) {
            [trend, plunge] = [args[0].trend, args[0].plunge]
        } else if(isFloatN(args, 2)) {
            [trend, plunge] = [args[0], args[1]]
        } else {
            console.log("unknown pole", args.length, args)
            return undefined
        }
        run_one(0, {type: "pole", strike: trend, dip: plunge})
        //addPole(trend, plunge, color)
    })
    func(vm, "pitch", (strike, dip, pitch1, pitch2) => {
        wait = true
        strike = vm.dump(strike)
        dip = vm.dump(dip)
        pitch1 = vm.dump(pitch1)
        pitch2 = vm.dump(pitch2)
        run_one(0, {type:"pole_animate_pitch", strike, dip, pitch: [pitch1, pitch2]})
    })
    func(vm, "color", (value) => { run_one(0, {type: "color", color: vm.dump(value)}) })
    func(vm, "delay", (value) => { run_one(0, {type: "delay", delay: vm.dump(value)}) })
    func(vm, "rotate", (value) => { run_one(0, {type: "rotate", angle: vm.dump(value)}) })
    func(vm, "pitchpole", (s,d,p) => {
        [s,d,p] = [s,d,p].map(vm.dump)
        return toObj(vm,  pitch_pole(s,d,p))
    })
    func(vm, "normal", (...args) => {
        let p = asPlane(args.map(vm.dump))
        if(!p)
            return
        return toObj(vm, pole_to_plane(p.strike, p.dip))
    })
    func(vm, "midpoint", (...args) => {
        args = args.map(vm.dump)
        let p1 = asPole(args)
        let p2 = asPole(args)
        return toObj(vm, average_pole(p1.trend, p1.plunge, p2.trend, p2.plunge))
    })
    func(vm, "intersect", (...args) => {
        args = args.map(vm.dump)
        let p1 = asPlane(args)
        let p2 = asPlane(args)
        return toObj(vm, plane_plane_intersection(p1.strike, p1.dip, p2.strike, p2.dip))
    })
    func(vm, "poles_to_plane", (...args) => {
        args = args.map(vm.dump)
        let p1 = asPole(args)
        let p2 = asPole(args)
        return toObj(vm, two_poles_to_plane(p1.trend, p1.plunge, p2.trend, p2.plunge))
    })
    func(vm, "tilt", (...args) => {
        args = args.map(vm.dump)
        let pole = asPole(args)
        let axis = asPole(args)
        let angle = args.shift()
        run_one(0, {type: "tilt", axis_trend: axis.trend, axis_plunge: axis.plunge, trend: pole.trend, plunge: pole.plunge, angle })
    })
    return vm;
}
function asPole(args) {
    if(args === undefined)
        return undefined
    if(isPole(args[0])) {
        return args.shift()
    }
    if(isFloatN(args, 2)) {
        let trend = args.shift()
        let plunge = args.shift()
        return {trend, plunge}
    }
    console.log("unknown pole", args)
    return undefined
}
function asPlane(args) {
    if(args === undefined)
        return undefined
    if(isPlane(args[0])) {
        return args.shift()
    }
    if(isFloatN(args, 2)) {
        let strike = args.shift()
        let dip = args.shift()
        return {strike, dip}
    }
    console.log("unknown plane", args)
    return undefined
}
function isFloatN(x, n) {
    return x !== undefined && x.length >= n && x.every(isFloat)
}
function isPole(x) {
    return isObject(x) && x.trend !== undefined && x.plunge !== undefined
}
function isPlane(x) {
    return isObject(x) && x.strike !== undefined && x.dip !== undefined
}
function isObject(x) {
    return typeof x === 'object' && !Array.isArray(x) && x !== null
}
function isFloat(n){
    return Number(n) === n
}
function isString(x) {
    return (typeof x === 'string' || x instanceof String)
}

function toObj(vm, obj) {
    const out = vm.newObject()
    for(const [k,v] of Object.entries(obj)) {
        vm.setProp(out, k, vm.newNumber(v))
    }
    return out
}


export function netjs(input) {
    run(input)
}

async function run(input) {
    if(input === undefined || input.length == 0)
        return

    
    c.reset()
    //for(const item of items) {
    //    scene.remove(item)
    //}
    //items = []

    //$('#out').textContent = ""
    let vm = init()

    const lines = input.split("\n")
    for(const line of lines) {
        wait = false
        //let result = vm.evalCode(input)
        let result = vm.evalCode(line)
        //console.log(input)
        if(result.error) {
            //$('#out').textContent += "Exection failed: " + vm.dump(result.error).message
            console.log("Execution failed: " + vm.dump(result.error).message)
            result.error.dispose()
        } else {
            let value = vm.dump(result.value)
            //if(value === undefined)
            //    value = "Ok"
            //$('#out').textContent += "Success: " + value
            result.value.dispose()
        }
        if(wait) 
            await sleep(delay / speed)
    }
    vm.dispose()
}


let delay = 200
let color = "black"
let speed = 1

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run_one(i, line) {
    //console.log(i, line)
    //editor.getSession().clearBreakpoints()
    //editor.getSession().setBreakpoint(i)
    if(line.type == "plane" || line.type == "pole") {
        const id = new Plane(line)
        id.change_color( color )
        c.add(id)
    } else if(line.type == "rotate") {
        await rot_animate(c, line.angle, delay / speed)
    } else if(line.type == "pole_animate_dip") {
        await pole_animate(c, line.strike, line.dip[0], line.dip[1], {
            color, delay: delay / speed
        })
    } else if(line.type == "pole_animate_pitch") {
        await pitch_animate(c, line.strike, line.dip, line.pitch[0], line.pitch[1], {
            color, delay: delay / speed
        })
    } else if(line.type == "tilt") {
        await pole_rotate_animate(c, line.axis_trend, line.axis_plunge, line.trend, line.plunge, line.angle, {
            color, delay: delay / speed
        })
    } else if(line.type == "color") {
        color = line.color
    } else if(line.type == "delay") {
        delay = line.delay * 1000
    } else if(line.type == "let") {
    } else if(line.type == "empty") {
    }
    //console.log(line)
    //await sleep(delay / speed)
    //console.log(line, 'done')
}
*/
export async function rot_animate(can, angle, duration) {
    let start = undefined
    let a0 = can.angle * 180.0 / Math.PI
    let request_id = null

    return new Promise(resolve => {
        function rot(timestamp) {
            if (start === undefined) {
                start = timestamp;
            }
            var progress = Math.min((timestamp - start) / duration, 1.0)
            can.rotate((a0 + angle * progress) * Math.PI/180.0);
            if(progress < 1) {
                request_id = requestAnimationFrame(rot);
            } else {
                cancelAnimationFrame(request_id)
                resolve()
            }
        }
        request_id = requestAnimationFrame(rot);
    })
}

export async function pole_animate(can, strike, dip0, dip1, opts = {}) {
    let color = opts.color || "black"
    let delay = opts.delay || 500
    let id = null
    //console.log("pole animate", opts, color)
    let start = undefined
    let dip = dip0
    let request_id = null;
    let dsdt = Math.abs(dip1 - dip0) / delay
    return new Promise(resolve => {
        function dotty(timestamp) {
            if(start === undefined) {
                start = timestamp
            }
            if(id !== null) {
                can.remove(id)
            }
            id = can.add(new Plane({type: "pole", color, strike, dip}))
            if(dip == dip1) {
                cancelAnimationFrame(request_id)
                resolve()
            } else {
                if(dip0 < dip1) { // Increasing dip
                    if(dip < dip1) {
                        dip = Math.min(dip0 + dsdt * (timestamp-start), dip1)
                    }
                } else {
                    if(dip > dip1) { // Decreasing dip
                        dip = Math.max(dip0 - dsdt * (timestamp-start), dip1)
                    }
                }
                request_id = requestAnimationFrame(dotty)
            }
        }
        request_id = requestAnimationFrame(dotty)
    })
}

export async function pole_rotate_animate(can, axis_trend, axis_plunge, trend, plunge,  angle, opts = {}) {
    let color = opts.color || "black"
    let delay = opts.delay || 500
    let id = null
    let start = undefined
    let request_id = null
    let angle0 = 0
    let angle1 = angle
    angle = angle0
    let p = new Pole(trend, plunge)
    let dadt = Math.abs(angle1 - angle0) / delay
    return new Promise(resolve => {
        function dotty(timestamp) {
            if(start === undefined) {
                start = timestamp
            }
            if(id != null) {
                can.remove(id)
            }
            let v = pole_rotate(axis_trend, axis_plunge, trend, plunge, angle)
            let p1 = new Pole(v.trend, v.plunge, { color } )
            id = can.add(p1)
            if(angle == angle1 || timestamp-start > delay) {
                cancelAnimationFrame(request_id)
                resolve()
            } else {
                if(angle1 > 0) {
                    if(angle < angle1) {
                        angle = Math.min(angle0 + dadt * (timestamp-start), angle1)
                    }
                } else {
                    //console.log("angle decreasing", angle, angle1, dadt)
                    if(angle > angle1) {
                        angle = Math.max(angle0 - dadt * (timestamp-start), angle1)
                    }
                }
                request_id = requestAnimationFrame(dotty)
            }
        }
        request_id = requestAnimationFrame(dotty)
    })
}

export async function pitch_animate(can, strike, dip, pitch0, pitch1, opts = {}) {
    let color = opts.color || "black"
    let delay = opts.delay || 500
    let id = null
    let start = undefined
    let pitch = pitch0
    let request_id = null;
    console.log("pitch animate", strike, dip, pitch0, pitch1)
    let dsdt = Math.abs(pitch1 - pitch0) / delay
    return new Promise(resolve => {
        function dotty(timestamp) {
            if(start === undefined) {
                start = timestamp
            }
            if(id !== null) {
                can.remove(id)
            }
            id = can.add(Pitch(strike, dip, pitch, color))
            if(pitch == pitch1) {
                cancelAnimationFrame(request_id)
                resolve()
            } else {
                if(pitch0 < pitch1) { // Increasing dip
                    if(pitch < pitch1) {
                        pitch = Math.min(pitch0 + dsdt * (timestamp-start), pitch1)
                    }
                } else {
                    if(pitch > pitch1) { // Decreasing dip
                        pitch = Math.max(pitch0 - dsdt * (timestamp-start), pitch1)
                    }
                }
                request_id = requestAnimationFrame(dotty)
            }
        }
        request_id = requestAnimationFrame(dotty)
    })
}


export async function animate(net3d, step) {
    let start = null
    let request_id = null
    let id = null
    return new Promise(resolve => {
        async function dotty(timestamp) {
            if(!start) {
                start = timestamp
            }
            if(id) {
                net3d.remove(id)
            }
            let item = step(timestamp-start)
            if(!item) {
                cancelAnimationFrame(request_id)
                resolve()
                return
            }
            id = net3d.add( item )
            request_id = requestAnimationFrame(dotty)
        }
        request_id = requestAnimationFrame(dotty)
    })
}
