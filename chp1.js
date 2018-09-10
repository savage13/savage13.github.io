Math.radians = function(degrees) { return degrees * Math.PI / 180; };
// Converts from radians to degrees.
Math.degrees = function(radians) { return radians * 180 / Math.PI; };
function sind(x) { return Math.sin( Math.radians( x ) ); }
function cosd(x) { return Math.cos( Math.radians( x ) ); }

function line(ctx, x, y, color, width) {
    ctx.beginPath();
    ctx.strokeStyle =  color;
    ctx.lineWidth = width;
    ctx.moveTo(x[0],y[0]);
    for(var i = 1; i < x.length; i++) {
        ctx.lineTo(x[i],y[i]);
    }
    ctx.stroke();
}

function canvas(id) {
    var obj = {};
    obj.canvas = document.getElementById(id);
    obj.ctx = obj.canvas.getContext('2d');
    obj.yflip = true;
    obj.line = function(a, b, color='black', width=2) {
        var x = [a.x,b.x];
        var y = [a.y, b.y];
        if(this.yflip) {
            var h = this.canvas.height;
            y = [h-y[0], h-y[1]];
        }
        line(this.ctx, x, y, color, width);
    }
    obj.text = function(txt, p, color='black', font='16px sans-serif') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        var y = p.y;
        if(this.yflip) {
            y = this.canvas.height - y;
        }
        this.ctx.fillText(txt, p.x, y);
    }
    obj.arc = function(p, r, from, to, anticlockwise=false, color='black') {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        var y = p.y
        if(this.yflip) {
            y = this.canvas.height - y;
        }
        this.ctx.arc(p.x,y,r,
                     Math.radians(from),
                     Math.radians(to),
                     anticlockwise=anticlockwise);
        this.ctx.stroke();
    }
    obj.point = function(p, r = 6, color='rgba(256,0,0,0.5)', stroke='rgba(0,0,0,0.5)') {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = stroke;
        var y = p.y
        if(this.yflip) {
            y = this.canvas.height - y;
        }
        this.ctx.arc(p.x,y,r, 0, 2.0 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }
    return obj;
}


function debug(x) {
    var d = document.getElementById('debug');
    d.innerHTML += x;
}

function geoline(ctx, x0,y0,r,angle, h, color, width) {
    var x1 = x0 + r * cosd(angle);
    var y1 = y0 + r * sind(angle);
    var x2 = x0 - r * cosd(angle);
    var y2 = y0 - r * sind(angle);
    line(ctx, [x1,x2], [h-y1,h-y2], color, width);
}

function scale_bar(ctx,w,h) {
    // Scale Bar
    line(ctx, [20,120],[h-15,h-15],'black',2)
    line(ctx, [20,20],[h-15+5,h-15-5],'black',2)
    line(ctx, [120,120],[h-15+5,h-15-5],'black',2)
    ctx.fillText('100 m', 50, h-20);
}
function north_arrow(ctx,w,h) {
    // North Arrow
    line(ctx, [10,10],[h-10,h-50], 'black', 2);
    var l = 7;
    line(ctx, [10,10-l],[h-50,h-(50-l)], 'black', 2);
    line(ctx, [10,10+l],[h-50,h-(50-l)], 'black', 2);
    ctx.font = '16px sans-serif';
    ctx.fillText('N', 5, h-50);
                       }
function line_intersection(p1,p2,p3,p4) {
    var dx1 = p1.x-p2.x;
    var dx3 = p3.x-p4.x;
    var dy1 = p1.y-p2.y;
    var dy3 = p3.y-p4.y;
    var c12 = (p1.x*p2.y - p1.y*p2.x);
    var c34 = (p3.x*p4.y - p3.y*p4.x);

    var px = c12*dx3 - dx1*c34;
    var py = c12*dy3 - dy1*c34;

    var d = dx1*dy3 - dy1*dx3;
    px = px / d;
    py = py / d;
    return {x:px, y:py};
}


function line_line_inter(x1,y1,a1, x3,y3,a3) {
    var x2 = x1 + cosd(a1);
    var y2 = y1 + sind(a1);
    var x4 = x3 + cosd(a3);
    var y4 = y3 + sind(a3);

    var dx1 = x1-x2;
    var dx3 = x3-x4;
    var dy1 = y1-y2;
    var dy3 = y3-y4;
    var c12 = (x1*y2 - y1*x2);
    var c34 = (x3*y4 - y3*x4);

    var px = c12*dx3 - dx1*c34;
    var py = c12*dy3 - dy1*c34;

    var d = dx1*dy3 - dy1*dx3;
    px = px / d;
    py = py / d;
    return {x:px, y:py};
}

function point(ctx, x,y,r=6.0,color='rgba(256,0,0,0.5)',stroke_color='rgba(0,0,0,0.5)') {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = stroke_color;
    ctx.arc(x,y,r, 0, 360);
    ctx.fill();
    ctx.stroke();
}

function text(ctx, txt, x, y, color='black', font='16px sans-serif') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(txt, x, y);
}

function poly(ctx,x,y,color, stroke_color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = stroke_color;
    ctx.moveTo(x[0],y[0]);
    for(var i = 0; i < x.length; i++) {
        ctx.lineTo(x[i],y[i]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function from_pt(a, r, angle) {
    return {x: a.x + r * cosd(angle), y: a.y + r * sind(angle)}
}

function dist(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}
function vsub(a,b) {
    return {x: a.x - b.x, y: a.y - b.y};
}

function norm(a) {
    var n = Math.sqrt(dot(a,a));
    return {x: a.x/n, y:a.y/n};
}
function dot(a,b) {
    return a.x*b.x + a.y*b.y;
}

function angle_between(a, b) {
    var d = dot(norm(a), norm(b));
    return Math.degrees( Math.acos( d ) );
}

function angle_to(a, b) {
    return Math.degrees( Math.atan2(b.y - a.y, b.x - a.x) );
}
