class Parser {
    constructor(input, mem = {}) {
        this.line = input
        this.i = 0
        this.stat = true
        this.mem = mem
    }
    c() {
        if(!this.ok()) {
            return undefined
        }
        return this.line[this.i]
    }
    adv(n = 1) {
        this.i += n
        this.stat = this.ok()
    }
    ok() {
        return this.i < this.line.length
    }
    next(str) {
        return this.line.slice(this.i).startsWith(str)
    }
}

function isspace(c) {
    return c == " " || c == "\t" || c == "\n" || c == "\f" || c == "\r"
}

function space(s) {
    while(s.ok() && isspace(s.c())) {
        s.adv()
    }
}

export function parse(line, mem = {}) {
    const s = new Parser(line, mem)
    if(!s.ok()) {
        return {type: "empty"}
    }
    if(s.c() == "#") {
        return {type:"comment"}
    }
    return statement(s)
}

function err(msg) {
    console.log(msg)
    return undefined
}

function statement(s) {
    space(s)

    if(s.next("let")) {
        s.adv(3)
        if(!isspace(s.c())) {
            return err(`expected 'let name = value', got '${s.line}' no space after let`)
        }
        let names = []
        while(true) {
            let name = ident(s)
            if(name === undefined) {
                return err(`expected 'let name = value', got '${s.line}' bad name`)
            }
            names.push(name)
            space(s)
            if(s.c() == ",") {
                s.adv()
                continue
            }
            if(s.c() != "=") {
                return err(`expected 'let name = value', got '${s.line}' missing =`)
            }
            break
        }
        s.adv()
        space(s)
        if(names.length != 1 && names.length != 2) {
            return err(`expected 'let name = value', got '${s.line}', multiple output values`)
        }
        if(names.length == 1) {
            let value = expression(s)
            if(value === undefined) {
                return err(`expected 'let name = value', got '${s.line}' missing value`)
            }
            s.mem[names[0]] = value
            return {type: "let", name: names[0], value }
        }
        // check for functions returning two values
        if(s.next("intersect")) {
            s.adv(9)
            if(!isspace(s.c())) {
                return err(`expected 'intersect strike1 dip1 strike2 dip2', got '${s.line}', no space intersect`)
            }
            let s1 = factor(s)
            if(s1 === undefined)
                return err(`expected 'intersect strike1 dip1 strike2 dip2', got '${s.line}', no strike1`)
            let d1 = factor(s)
            if(s1 === undefined)
                return err(`expected 'intersect strike1 dip1 strike2 dip2', got '${s.line}', no dip1`)
            let s2 = factor(s)
            if(s1 === undefined)
                return err(`expected 'intersect strike1 dip1 strike2 dip2', got '${s.line}', no strike2`)
            let d2 = factor(s)
            if(s1 === undefined)
                return err(`expected 'intersect strike1 dip1 strike2 dip2', got '${s.line}', no dip2`)
            const pole = plane_plane_intersection(s1, d1, s2, d2)
            let values = pole
            s.mem[names[0]] = pole.trend
            s.mem[names[1]] = pole.plunge
            return {type: "let", names, values}
        }
        if(s.next("pitchpole")) {
            s.adv(9)
            if(!isspace(s.c())) {
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no space pitchpole`)
            }
            let strike = factor(s)
            if(strike === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no strike`)
            let dip = factor(s)
            if(dip === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no dip`)
            let pitch = factor(s)
            if(pitch === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no pitch`)
            let pole = pitch_pole(strike, dip, pitch)
            //console.log('pitch pole', strike, dip, pitch, pole)
            if(pole == undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', error computing pole`)
            let values = pole
            s.mem[names[0]] = pole.trend
            s.mem[names[1]] = pole.plunge
            return {type: "let", names, values }
        }
        if(s.next("normal")) {
            s.adv(6)
            if(!isspace(s.c())) {
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no space pitchpole`)
            }
            let strike1 = factor(s)
            if(strike1 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no strike`)
            let dip1 = factor(s)
            if(dip1 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no dip`)
            let pole = pole_to_plane(strike1, dip1)
            let values = pole
            s.mem[names[0]] = pole.trend
            s.mem[names[1]] = pole.plunge
            return {type: "let", names, values}
        }
        if(s.next("midpoint")) {
            console.log("midpoint")
            s.adv(8)
            if(!isspace(s.c())) {
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no space pitchpole`)
            }
            let trend1 = factor(s)
            if(trend1 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no strike`)
            let plunge1 = factor(s)
            if(plunge1 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no dip`)
            let trend2 = factor(s)
            if(trend2 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no pitch`)
            let plunge2 = factor(s)
            if(plunge2 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no pitch`)
            console.log(trend1, plunge2, trend2, plunge2)
            let pole = average_pole(trend1, plunge1, trend2, plunge2)
            if(pole == undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', error computing pole`)
            let values = pole
            console.log("pole", pole)
            s.mem[names[0]] = pole.trend
            s.mem[names[1]] = pole.plunge
            return {type: "let", names, values}
        }
        if(s.next("poles_to_plane")) {
            console.log("poles_to_plane")
            s.adv(14)
            if(!isspace(s.c())) {
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no space pitchpole`)
            }
            let trend1 = factor(s)
            if(trend1 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no strike`)
            let plunge1 = factor(s)
            if(plunge1 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no dip`)
            let trend2 = factor(s)
            if(trend2 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no pitch`)
            let plunge2 = factor(s)
            if(plunge2 === undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', no pitch`)
            console.log(trend1, plunge2, trend2, plunge2)
            let pole = two_poles_to_plane(trend1, plunge1, trend2, plunge2)
            if(pole == undefined)
                return err(`expected 'pitchpole strike dip pitch', got '${s.line}', error computing pole`)
            let values = pole
            s.mem[names[0]] = pole.strike
            s.mem[names[1]] = pole.dip
            return {type: "let", names, values}
        }
        return err(`exptected function returning muliple values, got '${s.line}': intersect`)
    } else if(s.next("pole")) {
        s.adv(4)
        if(!isspace(s.c())) {
            return err(`expected 'pole trend plunge', got '${s.line}', no space after pole`)
        }
        let strike = factor(s)
        let dip = factor(s)
        space(s)
        if(s.c() == ":") {
            s.adv()
            let v2 = factor(s)
            if(v2 === undefined) {
                return err(`expected 'pole trend plunge:plunge', got '${s.line}'`)
            }
            dip = [dip, v2]
            return {type: "pole_animate_dip", strike, dip }
        }
        if(strike == undefined || dip == undefined) {
            return err(`expected 'pole trend plunge', got ${s.line}, bad trend or plunge`)
        }
        return {type: "pole", strike, dip }
    } else if(s.next("plane")) {
        s.adv(5)
        if(!isspace(s.c())) {
            return err(`expected 'plane strike dip', got '${s.line}', no space after plane`)
        }
        let strike = factor(s)
        let dip = factor(s)
        if(strike == undefined || dip == undefined) {
            return err(`expected 'plane strike dip', got ${s.line}, bad strike or dip`)
        }
        return check_for_modifier(s, {type: "plane", strike, dip})
        //return {type: "plane", strike, dip }
    } else if(s.next("color")) {
        s.adv(5)
        if(!isspace(s.c())) {
            return err(`expected 'color name', got '${s.line}', no space after color`)
        }
        let color = ident(s)
        return {type: "color", color }
    } else if(s.next("delay")) {
        s.adv(5)
        if(!isspace(s.c())) {
            return err(`expected 'color name', got '${s.line}', no space after color`)
        }
        space(s)
        let delay = factor(s)
        return {type: "delay", delay }
    } else if(s.next("rotate")) {
        s.adv(6)
        if(!isspace(s.c())) {
            return err(`expected 'rotate angle', got '${s.line}', no space after rotate`)
        }
        space(s)
        let angle = factor(s)
        return {type: "rotate", angle }
    } else if(s.next("pitch")) {
        s.adv(5)
        if(!isspace(s.c())) {
            return err(`expected 'pitch strike dip pitch', got '${s.line}', no space after pitch`)
        }
        let strike = factor(s)
        let dip = factor(s)
        let pitch = factor(s)
        if(s.c() == ":") {
            s.adv()
            let v2 = factor(s)
            if(v2 === undefined) {
                return err(`expected 'pitch strike dip pitch:pitch2', got '${s.line}'`)
            }
            pitch = [pitch, v2]
            return {type: "pole_animate_pitch", strike, dip, pitch }
        }
        if(strike === undefined || dip === undefined || pitch === undefined) {
            return err(`expected 'pitch strike dip pitch', got ${line}, bad strike, dip or pitch`)
        }
        return {type: "pitch", strike, dip, pitch }

    } else {
        return expression(s)
    }
}

function angle_180(v) {
    while(v < -180) {
        v += 360
    }
    while(v >= 180) {
        v -= 360
    }
    return v
}

function check_for_modifier(s, obj) {
    let dirs = {N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }
    space(s)
    if(!s.ok()) {
        return obj
    }
    let mod = ident(s)
    if(mod == undefined) {
        return obj
    }
    let Mod = mod.toUpperCase()
    let dir = dirs[Mod]
    if(dir == undefined) {
        return err(`expected 'plane strike dip direction', got '${s.line}', unknown direction ${mod}`)
    }
    let angle1 = angle_180(dir - obj.strike)
    let angle2 = angle_180(dir - (obj.strike + 180))

    if(Math.abs(angle1) < 45) {
        return err(`expected 'plane strike dip direction', got '${s.line}', |strike-direction| < 45 ${angle1}`)
    }
    if(Math.abs(angle2) < 45) {
        return err(`expected 'plane strike dip direction', got '${s.line}', |strike+180-direction| < 45 ${angle2}`)
    }

    //console.log(obj.strike, dir, angle1, angle2)
    if(angle1 > 0) { // Dip direction preceeds strike, default
    } else { // Dip direction preceeds strike, flip the strike
        obj.strike += 180
        if(obj.strike >= 360) {
            obj.strike -= 360
        }
    }
    
    return obj
}
    

function expression(s) {
    //console.log('expr', s)
    let scale = 1
    space(s)
    if(!s.ok()) {
        console.log(`expected 'expression', got ${s.line}, end of string`)
        return undefined
    }
    if(s.ok() && (s.c() == "-" || s.c() == "+")) {
        if(s.c() == "-") {
            scale = -1
        }
        s.adv()
    }
    space(s)
    let a = term(s) 
    //console.log('expr(a)', a)
    if(a === undefined) {
        console.log(`expected 'expression', got ${s.line}, unknown 1st term`)
        return undefined
    }
    a = a * scale
    while(true) {
        space(s)
        if(s.c() != "+" && s.c() != "-") {
            return a
        }
        let op = s.c()
        s.adv()
        //console.log('expr(op)', op)
        space(s)
        let b = term(s)
        //console.log('expr(b)', b)
        if(b === undefined) {
            console.log(`expected 'expression', got ${s.line}, unknown 2nd term`)
            return undefined
        }
        if(op == "+") {
            //console.log("expr(a+b)", a, b)
            a = a + b
        } else if(op == "-") {
            //console.log("expr(a-b)", a, b)
            a = a - b
        }
    }
    return undefined
}

function term(s) {
    space(s)
    let a = factor(s)
    //console.log('term(a)', a)
    if(a == undefined) {
        console.log(`expected 'term', got ${s.line}, unknown 1st factor`)
        return undefined
    }
    while(true) {
        space(s)
        //console.log(s.c())
        if(s.c() != "*" && s.c() != "/") {
            return a
        }
        let op = s.c()
        s.adv()

        space(s)
        let b = factor(s)
        //console.log('term(b)', op, b)
        if(b === undefined) {
            console.log(`expected 'term', got ${s.line}, unknown 2nd factor`)
            return undefined
        }
        if(op == "*") {
            //console.log('term(a,op,b)',a,op,b)
            a = a * b
        } else if(op == "/") {
            //console.log('term(a,op,b)',a,op,b)
            a = a / b
        }
    }
    return undefined
}

function isalpha(c) {
    const a = 'a'.charCodeAt(0)
    const z = 'z'.charCodeAt(0)
    const A = 'A'.charCodeAt(0)
    const Z = 'Z'.charCodeAt(0)
    let code = c.charCodeAt(0)
    if(code >= a && code <= z)
        return true
    if(code >= A && code <= Z)
        return true
    return false
}
function isnumer(c) {
    const _0 = '0'.charCodeAt(0)
    const _9 = '9'.charCodeAt(0)
    let code = c.charCodeAt(0)
    return code >= _0 && code <= _9
}

function int(s, div = false) {
    let v = 0
    let n = 1
    while(s.ok() && isnumer(s.c())) {
        let k = s.c().charCodeAt(0) - '0'.charCodeAt(0)
        if(div) {
            v = v + k/Math.pow(10,n)
            n += 1
        } else {
            v = v * 10 + k
        }
        s.adv()
    }
    return v
}

function number(s) {
    let v = 0
    space(s)
    let pre = int(s)
    if(s.c() != ".") {
        return pre
    }
    s.adv()
    let post = int(s, true)
    return pre + post
}

function ident(s) {
    let name = ""
    if(!s.ok()) {
        console.log(`expected 'name', got '${s.line}', end of input`)
        return undefined
    }
    space(s)
    let c = s.c()
    if(c != "_" && !isalpha(c)) {
        console.log(`expected 'name', got '${s.line}', name starts with _ or alpha ${c}`)
        return undefined
    }
    // check here to see if geographic direction is available [nsew]###[nsew]
    name += c
    s.adv()
    c = s.c()
    while(s.ok() && (isalpha(c)  || isnumer(c) || c == "_")) {
        name += c
        s.adv()
        c = s.c()
    }

    return name
}

const geo_dir = new RegExp("^([NSEW])([0-9]{1,3})([NEWS])$","i")

function ident_value(s) {
    let name = ident(s)
    if(name == undefined) {
        console.log(`expected 'ident', got '${s.line}'`)
        return undefined
    }
    // Matches a Direction like N45W
    const m = name.match(geo_dir)
    if(m) {
        let news = { 'N': 0, 'S': 180, 'E': 90, 'W': 270 }
        let init = news[m[1].toUpperCase()]
        let amt = parseFloat(m[2])
        let dir = news[m[3].toUpperCase()]
        let change = dir - init
        if(change == 0 || Math.abs(change) == 180) {
            return err(`expected Quad notation 'N45W', got ${name}`)
        }
        if(Math.abs(change) == 270 && (init == 270 || init == 0)) { // W??N
            if(init == 270) {
                change = 90
                init = 270
                dir = 360
            } else {
                change = -90
                init = 360
                dir = 270
            }
        }
        if(Math.abs(change) != 90) {
            return err(`expected Quad notation 'N45W', got ${name} (change != 90) ${change}`)
        }
        if(amt > 90) {
            return err(`expected Quad notation 'N45W', got ${name} (amount >= 90) ${amt}`)
        }
        let scale = change / Math.abs(change)
        //console.log('quad', init, amt, dir, change, scale)
        let value = init + scale * amt
        return value
    }
    if(!(name in s.mem)) {
        console.log(`expected 'ident', got '${s.line}' unknown value ${name}`)
        return undefined
    }
    return s.mem[name]
}

function factor(s) {
    let scale = 1
    space(s)
    if(!s.ok()) {
        console.log(`expected 'factor', got '${s.line}', end of string`)
        return undefined
    }
    if(s.c() == "-" || s.c() == "+") {
        if(s.c() == "-") {
            scale = -1
        }
        s.adv()
    }
    let c = s.c()
    if(isnumer(c) || c == ".") {
        //console.log("factor ", c)
        return scale * number(s)
    }
    if(isalpha(c) || c == "_") {
        let value = ident_value(s)
        if(value === undefined)
            return undefined
        return scale * value
    }
    if(c == "(") {
        //console.log('factor (expr)', s.line.slice(s.i))
        s.adv()
        space(s)
        let exp = expression(s)
        space(s)
        if(s.c() != ")") {
            return undefined
        }
        s.adv()
        return scale * exp
    }
    console.log(`expected 'factor', got '${s.line}', unknown factor '${s.line.slice(s.i)}'`)
    return undefined
}

function tests() {
    let lines = `1
let strike = 45
let dip = 32.45
let pitch = 23.44
1+2
2*3

1 + 2
 1 + 2

2 * 3
2* 3

1+2*3
3+2*1
(1+2)*3
-1 * strike
-strike
strike + 90
180 - strike - 90
0.12
200.12
0.012345
color red
delay 0.2
pole strike dip
plane (strike + 90) dip
pitch (strike + 90) dip 87
pole strike 0:dip
pitch strike dip 0:60
let strike = N45E
let strike = E45N
let strike = N45W
let strike = W45N
let strike = S45E
let strike = E45S
let strike = S45W
let strike = W45S
let strike = N100E
plane strike 45Z
plane strike 45NE
plane 90 45E
plane 90 45W
plane 270 45W
plane 270 45E

plane 45 45 SE
plane 55 45 SE
plane 65 45 SE
plane 75 45 SE
plane 85 45 SE
plane 95 45 SE
plane 175 45 SE
plane 185 45 SE
plane 195 45 SE
plane 205 45 SE
plane 215 45 SE
plane 225 45 SE
plane 235 45 SE
plane 245 45 SE
plane 255 45 SE
plane 265 45 SE
plane 275 45 SE

plane 45 45 NW
plane 55 45 NW
plane 65 45 NW
plane 75 45 NW
plane 85 45 NW
plane 95 45 NW

plane 175 45 NW
plane 185 45 NW
plane 195 45 NW
plane 205 45 NW
plane 215 45 NW
plane 225 45 NW
plane 235 45 NW
plane 245 45 NW
plane 255 45 NW
plane 265 45 NW
plane 275 45 NW

plane 5 45 NW
plane 15 45 NW
plane 25 45 NW
plane 35 45 NW
plane 45 45 NW

plane 5 45 SE
plane 15 45 SE
plane 25 45 SE
plane 35 45 SE
plane 45 45 SE

(1 + 2 + 3 ) / 2
(12 + -37 + 90 + 90) / 2
(90-12)
(90-47)
((90-12) + (90-47))
((90-12) + (90-47))/2
`
    let mem = {}
    for(const line of lines.split("\n")) {
        let v = parse(line, mem)
        console.log(v,`       ${line}`)
    }
}

//if(require.main === module) {
//tests()
//}

class Vec {
    constructor(v) {
        this.v = v
    }
    norm() {
        let len = this.len()
        return this.scale(1./len)
    }
    down() {
        let s = (this.v[2] > 0) ? -1 : 1
        return this.scale(s)
    }
    scale(value) {
        return new Vec(this.v.map(v => v * value))
    }
    len() {
        let sq = this.v.map(v => v*v)
        let sum = 0
        for(let i = 0; i < sq.length; i++) {
            sum += sq[i]
        }
        return Math.sqrt(sum)
    }
    add(b) {
        return new Vec([this.v[0] + b.v[0], this.v[1] + b.v[1], this.v[2] + b.v[2]])
    }
    raw() {
        return this.v
    }
    fmt() {
        return this.v.map(v => v.toFixed(4)).join(", ")
    }
    dot(b) {
        let n = this.v.length
        let m = b.v.length
        if(n != m) {
            throw new Error('dot product inconsistent lengths')
        }
        let out = 0
        for(let i = 0; i < n; i++) {
            out += this.v[i] * b.v[i]
        }
        return out
    }
}

function cosd(angle) { return Math.cos(angle * Math.PI / 180) }
function sind(angle) { return Math.sin(angle * Math.PI / 180) }
function tand(angle) { return Math.tan(angle * Math.PI / 180) }
function acosd(v) { return Math.acos(v) * 180 / Math.PI }
function atan2d(y, x) { return Math.atan2(y,x) * 180 / Math.PI }
function atand(v) { return Math.atan(v) * 180 / Math.PI }

export function plane_normal(strike, dip) {
    let angle = 90 - strike
    let x = cosd(angle - 90)
    let y = sind(angle - 90)
    let r = Math.sqrt(x*x + y*y)
    let z = r * tand(90-dip)
    return new Vec([x,y,z]).down().norm()
}

// Get the vector equivalent of a pole
export function pole_normal(trend, plunge) {
    // Assuming the angle (plunge) is positive down
    //  so we use the negative plunge to make z down
    let angle = 90 - trend
    //p.textContent += `pole normal ${trend} ${plunge} ${angle}\n`
    let x = cosd(angle)
    let y = sind(angle)
    //p.textContent += `pole normal ${x} ${y}\n`
    let r = Math.sqrt(x*x + y*y)
    let z = r * tand(-plunge)
    return new Vec([x,y,z]).down().norm()
}

// Get the pole equivalent for a vector
export function normal_to_line(n) {
    n = n.down().raw()
    let x = n[0]
    let y = n[1]
    let z = n[2]
    let r = Math.sqrt(x*x + y*y)
    let angle = atan2d(y, x)
    let trend = 90 - angle
    let plunge = atand(z/r)
    if(plunge > 90) {
        plunge = plunge - 90
        trend = trend + 180
        if(trend > 360) {
            trend -= 360
        }
    }
    if(plunge < 0) {
        plunge = -plunge
    }
    return { trend, plunge }
}

// Get plane from normal vector
function normal_to_plane(n) {
    // Force normal to be facing down
    n = n.down().raw()
    let x = n[0]
    let y = n[1]
    let z = n[2]
    let r = Math.sqrt(x*x + y*y)
    let angle = atan2d(y, x)
    // Strike is 90 ahead of normal 
    let strike = (90 - angle) + 90
    // z/r is always negative
    // z/r (vertical pole z = -1, r ~ 0) (plane is horizontal) dip = 0
    // z/r (horizontal pole z = 0, r = 1) (plane is vertical) dip = 90
    // atand(z/r) => [0 to -90]
    // ztand(z/r) + 90 => [90 to 0]
    let dip = 90 + atand(z/r)
    return { strike, dip }
}

function cross(a, b) {
    a = a.raw()
    b = b.raw()
    let c = [a[1]*b[2] - a[2]*b[1],
             a[2]*b[0] - a[0]*b[2],
             a[0]*b[1] - a[1]*b[0]]
    return new Vec(c)
}

let p
function vfmt(value) {
    return value.map(v => v.toFixed(4)).join(", ")
}

// Gets intersection between two planes
export function plane_plane_intersection(strike1, dip1, strike2, dip2) {

    let n1 = plane_normal(strike1, dip1)
    let n2 = plane_normal(strike2, dip2)
    let c = cross(n1, n2)
    if(c.len() == 0) {
        return undefined
    }
    return normal_to_line(c)
}


// Gets the normal (or pole) for a plane
export function pole_to_plane(strike, dip) {
    return normal_to_line(plane_normal(strike, dip))
}
export function plane_to_pole(trend, plunge) {
    return normal_to_plane(pole_normal(trend, plunge))
}

export function two_poles_to_plane(trend1, plunge1, trend2, plunge2) {
    //p.textContent = ``
    let n1 = pole_normal(trend1, plunge1)
    let n2 = pole_normal(trend2, plunge2)
    //p.textContent += `n1 ${n1.fmt()}\n`
    //p.textContent += `n2 ${n2.fmt()}\n`
    let c = cross(n1, n2).down()
    //p.textContent += `c ${c.fmt()}\n`
    if(c.len() == 0) {
        return undefined
    }
    return normal_to_plane(c)
}

export function pitch_pole(strike, dip, pitch) {
    if(pitch < 0) {
        return pitch_pole(strike, dip, pitch + 360)
    }
    if(pitch > 180) {
        return pitch_pole(strike, dip, pitch - 180)
    }
    let gt90 = pitch > 90
    if(gt90) {
        pitch = 180 - pitch
    }
    let beta = atand( tand(pitch) * cosd(dip))
    if(gt90) {
        beta = 180 - beta
    }
    const trend = strike + beta
    const plunge = asind( sind(dip) * sind(pitch))
    return { trend, plunge }
}

// Plane Plane Intersection (s1,d1,s2,d2) => (t,p) Done
// Pole from Plane and Pitch (s,d,angle) => (t,p) Done
// Two poles to Plane (t1,p1, t2,p2) => (s,d) Done
// Rotation of Pole (t,p,angle) => (t,p)

function rotate_on_axis(axis, vec, angle) {
    let v = vec
    let u = axis.norm().raw()
    let ux = u[0]
    let uy = u[1]
    let uz = u[2]
    let c = cosd(angle)
    let c1 = (1-c)
    let s = sind(angle)
    let R = [
        [
            ux * ux * c1 + c,
            ux * uy * c1 - uz * s,
            ux * uz * c1 + uy * s
        ],
        [
            ux * uy * c1 + uz * s,
            uy * uy * c1 + c,
            uy * uz * c1 - ux * s
        ],
        [
            ux * uz * c1 - uy * s,
            uy * uz * c1 + ux * s,
            uz * uz * c1 + c
        ]
    ]
    let R0 = new Vec(R[0])
    let R1 = new Vec(R[1])
    let R2 = new Vec(R[2])
    return new Vec( [v.dot(R0), v.dot(R1), v.dot(R2)] )
}

// Angle: with axis at (1,0,0)
//    positive rotates point towards the right
export function pole_rotate(strike, dip, trend, plunge, angle) {
    let axis = pole_normal(strike, dip)
    let n = pole_normal(trend, plunge)
    let v = rotate_on_axis(axis, n, -angle)
    return normal_to_line(v)
}

export function average_pole(trend1, plunge1, trend2, plunge2) {
    let n1 = pole_normal(trend1, plunge1)
    let n2 = pole_normal(trend2, plunge2)
    let v = n1.add(n2).scale(0.5)
    return normal_to_line(v)
}

export class Pole {
    constructor(trend, plunge, opts = {}) {
        this.trend = trend
        this.plunge = plunge
        this.type = "pole"
        this.style = new Style(opts)
        this.id = opts.id || undefined
        if(this.plunge > 90) {
            this.plunge = 90.0 - this.plunge
            this.trend = zero_360(this.trend + 180)
        }
    }
    draw(net) {
        let size = net.pole_size
        net.cx.save()
        net.cx.rotate((this.trend + 270) * Math.PI/180)
        net.cx.beginPath()
        this.style.fill(net)
        let z = net.project(0.0, 90 - this.plunge)
        //console.log(z, this.trend, this.plunge, net.radius, size, this.style)
        net.cx.arc(net.radius * z.x, -net.radius * z.y, size, 0, 2.0 * Math.PI, 1)
        net.cx.fill()
        net.cx.restore()
    }
    average(p2) {
        let a = average_pole(this.trend, this.plunge, p2.trend, p2.plunge)
        return new Pole(a.trend, a.plunge)
    }
    shared_plane(p2) {
        let p = two_poles_to_plane(this.trend, this.plunge, p2.trend, p2.plunge)
        return new Plane2(p.strike, p.dip, this.opts())
    }
    rotate(axis, angle) {
        if(angle == undefined)
            return undefined
        let p = pole_rotate(axis.trend, axis.plunge, this.trend, this.plunge, angle)
        return new Pole(p.trend, p.plunge, this.opts())
    }
    plane() {
        let p = plane_to_pole(this.trend, this.plunge)
        return new Plane2(p.strike, p.dip, this.opts())
    }
    opacity(value) {
        this.style.opacity = value
        return this
    }
    opts() {
        return {
            color: this.style.color,
            opacity: this.style.opacity,
            id: this.id
        }
    }
    copy() {
        return new Pole(this.trend, this.plunge, this.opts())
    }
    uid(value) {
        this.id = value
        return this
    }
}

export class Plane2 {
    constructor(strike, dip, opts = {}) {
        this.strike = strike
        this.dip = dip
        this.type = "plane"
        this.style = new Style(opts)
        this.id = undefined
        if(this.dip > 90) {
            this.dip = 90 - this.dip
            this.strike = zero_360(this.strike + 180)
        }
    }
    draw(net) {
        let width = net.plane_width
        net.cx.save()
        net.cx.rotate(this.strike * Math.PI / 180)
        this.style.stroke(net)
        net.great_circle( 90 - this.dip)
        net.cx.restore()
    }
    normal() {
        let p = pole_to_plane(this.strike, this.dip)
        return new Pole(p.trend, p.plunge, this.opts())
    }
    intersection(p2) {
        let x = plane_plane_intersection(this.strike, this.dip, p2.strike, p2.dip)
        return new Pole(x.trend, x.plunge, this.opts())
    }
    opacity(value) { // 0.0 to 1.0
        this.style.opacity = value
        return this
    }
    opts() {
        return {
            color: this.style.color,
            opacity: this.style.opacity
        }
    }
    uid(value) {
        this.id = value
        return this
    }

}
