
// http://learningwebgl.com/blog/?p=28
var gl;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }
    
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // Used for a texture
    //shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    //gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    // Used for a color
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


function handleLoadedTexture(textures) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[2].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}


var crateTextures = Array();

function initTexture() {
    var crateImage = new Image();

    for (var i=0; i < 3; i++) {
        var texture = gl.createTexture();
        texture.image = crateImage;
        crateTextures.push(texture);
    }

    crateImage.onload = function () {
        handleLoadedTexture(crateTextures)
    }
    crateImage.src = "crate.gif";
}


var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


var xRot = 0;
var xSpeed = 0;

var yRot = 30;
var ySpeed = 0;

var z = -4.0;

var filter = 0;

var currentlyPressedKeys = {};

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var moonRotationMatrix = mat4.create();
mat4.identity(moonRotationMatrix);

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}
function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaX / 5), [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaY / 5), [1, 0, 0]);

    mat4.multiply(moonRotationMatrix, newRotationMatrix, moonRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}
/*
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;

    if (String.fromCharCode(event.keyCode) == "F") {
        filter += 1;
        if (filter == 3) {
            filter = 0;
        }
    }
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys() {
    if (currentlyPressedKeys[33]) {
        // Page Up
        z -= 0.05;
    }
    if (currentlyPressedKeys[34]) {
        // Page Down
        z += 0.05;
    }
    if (currentlyPressedKeys[37]) {
        // Left cursor key
        ySpeed -= 1;
        yRot -= 1;
    }
    if (currentlyPressedKeys[39]) {
        // Right cursor key
        ySpeed += 1;
        yRot += 1;
    }
    if (currentlyPressedKeys[38]) {
        // Up cursor key
        xSpeed -= 1;
        xRot -= 1;
    }
    if (currentlyPressedKeys[40]) {
        // Down cursor key
        xSpeed += 1;
        xRot += 1;
    }
}
*/

var cube;
var plane;
var line;
var north;
var north1;
var north2;

function cube_basic(x, y, z) {
    var vertices = [
        // Front face
        -x, -y,  z,
        x, -y,  z,
        x,  y,  z,
        -x,  y,  z,

        // Back face
        -x, -y, -z,
        -x,  y, -z,
        x,  y, -z,
        x, -y, -z,

        // Top face
        -x,  y, -z,
        -x,  y,  z,
        x,  y,  z,
        x,  y, -z,

        // Bottom face
        -x, -y, -z,
        x, -y, -z,
        x, -y,  z,
        -x, -y,  z,

        // Right face
        x, -y, -z,
        x,  y, -z,
        x,  y,  z,
        x, -y,  z,

        // Left face
        -x, -y, -z,
        -x, -y,  z,
        -x,  y,  z,
        -x,  y, -z,
    ];

    return vertices;
}

function cube_rot(x,y,z,dip,x0,y0,z0) {
    var v = cube_basic(x,y,z);
    var a = [];
    var origin = vec3.fromValues(0,0,0);
    var dx = vec3.fromValues(x0,y0,z0);
    for(var i = 0; i < 24*3; i+=3) {
        let r = vec3.fromValues(v[i], v[i+1], v[i+2]);
        r = vec3.add(r, r, dx);
        r = vec3.rotateX(r, r, origin, degToRad(dip));
        a.push(r[0]);
        a.push(r[1]);
        a.push(r[2]);
    }
    return a;
}

function cubeColors(front, back, top, bottom, right, left) {
    var colors = [
        front[0], front[1], front[2], front[3],
        front[0], front[1], front[2], front[3],
        front[0], front[1], front[2], front[3],
        front[0], front[1], front[2], front[3],

        back[0], back[1], back[2], back[3],
        back[0], back[1], back[2], back[3],
        back[0], back[1], back[2], back[3],
        back[0], back[1], back[2], back[3],

        top[0], top[1], top[2], top[3],
        top[0], top[1], top[2], top[3],
        top[0], top[1], top[2], top[3],
        top[0], top[1], top[2], top[3],

        bottom[0], bottom[1], bottom[2], bottom[3],
        bottom[0], bottom[1], bottom[2], bottom[3],
        bottom[0], bottom[1], bottom[2], bottom[3],
        bottom[0], bottom[1], bottom[2], bottom[3],

        right[0], right[1], right[2], right[3],
        right[0], right[1], right[2], right[3],
        right[0], right[1], right[2], right[3],
        right[0], right[1], right[2], right[3],

        left[0], left[1], left[2], left[3],
        left[0], left[1], left[2], left[3],
        left[0], left[1], left[2], left[3],
        left[0], left[1], left[2], left[3],
    ];
    return colors;
}

function cube_create_simple(x,y,z,color) {
    return cube_create(x,y,z,color, color, color, color, color, color);
}

function cube_create(x,y,z, front,back,top,bottom,right,left) {
    // Vertex
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    var vertices = cube_basic(x, y, z);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertex_buffer.itemSize = 3;
    vertex_buffer.numItems = 24;

    // Color
    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var colors = cubeColors(front, back, top, bottom, right, left);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    color_buffer.itemSize = 4;
    color_buffer.numItems = 24;

    // Index
    var index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    var cubeVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    index_buffer.itemSize = 1;
    index_buffer.numItems = 36;

    var v = new Object();
    v.vertex = vertex_buffer;
    v.color = color_buffer;
    v.index = index_buffer;
    return v;
}
function initBuffers() {
    var x = 1.0;
    var y = 0.02;
    var z = 1.0; // Half widths
    var r0 = 0.7;
    var alpha = 1.0;

    cube   = cube_create_simple(x,y,z,[r0,0,0,alpha]);
    plane  = cube_create_simple(x,y,z,[0,r0,0,alpha]);
    var z  = 0.02;
    var x  = 1.1;
    line   = cube_create_simple(x,y,z,[0,0,r0,alpha]);
    var x  = 0.2;
    north  = cube_create_simple(x,y,z,[0,0,0,alpha]);
    var x  = 0.075;
    north1 = cube_create_simple(x,y,z,[0,0,0,alpha]);
    north2 = cube_create_simple(x,y,z,[0,0,0,alpha]);

}

function show_item(v) {
    // Vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, v.vertex);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, v.vertex.itemSize, gl.FLOAT, false, 0, 0);
    // Color
    gl.bindBuffer(gl.ARRAY_BUFFER, v.color);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, v.color.itemSize, gl.FLOAT, false, 0, 0);
    // Index
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, v.index);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, v.index.numItems, gl.UNSIGNED_SHORT, 0);

}


function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, z]);
    mat4.multiply(mvMatrix, mvMatrix, moonRotationMatrix); 

    //mat4.rotate(mvMatrix, mvMatrix, degToRad(xRot), [1, 0, 0]);
    //mat4.rotate(mvMatrix, mvMatrix, degToRad(yRot), [0, 1, 0]);

    // "Cube"
    mvPushMatrix();
    {
        show_item(cube);
    }
    mvPopMatrix();

    // Plane
    mvPushMatrix();
    {
        // http://paulbourke.net/geometry/rotate/
        var dip = document.getElementById("dip").value;
        var strike = 90.0 - document.getElementById("strike").value;

        // Strike Rotation
        mat4.rotate(mvMatrix,mvMatrix, degToRad(strike),[0,1,0]);

        // Z Rotation along x = 1.0
        var dx0 = vec3.fromValues(1,0,0)
        var dx1 = vec3.negate(vec3.clone(dx0), dx0);
        mat4.translate(mvMatrix, mvMatrix, dx0); // 1 translate to origin
        mat4.rotate(mvMatrix,mvMatrix, degToRad(0.0),[1,0,0]); // 2 x-axis rotation
        mat4.rotate(mvMatrix,mvMatrix, degToRad(0.0),[0,1,0]); // 3 y-axis rotation
        mat4.rotate(mvMatrix, mvMatrix, degToRad(dip), [0, 0, 1]); // 4 z-axis rotation
        mat4.rotate(mvMatrix, mvMatrix, degToRad(-0.0), [0, 1, 0]); // 5 y-axis rotation
        mat4.rotate(mvMatrix, mvMatrix, degToRad(-0.0), [1, 0, 0]); // 6 x-axis rotation
        mat4.translate(mvMatrix, mvMatrix, dx1); // 1

        show_item(plane);
    }
    mvPopMatrix();

    // Trend
    mvPushMatrix();
    {
        var plunge = document.getElementById("plunge").value;
        var trendv = 90.0 - document.getElementById("trend").value;

        var x = document.getElementById("x").value;
        var y = document.getElementById("y").value;

        // Trend Rotation
        mat4.rotate(mvMatrix,mvMatrix, degToRad(trendv),[0,1,0]);
        // Shift Line Element
        mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(x,0,y));

        // Z Rotation along x = 1.0
        var dx0 = vec3.fromValues(1,0,0)
        var dx1 = vec3.negate(vec3.clone(dx0), dx0);
        mat4.translate(mvMatrix, mvMatrix, dx0); // 1 translate to origin
        mat4.rotate(mvMatrix,mvMatrix, degToRad(0.0),[1,0,0]); // 2 x-axis rotation
        mat4.rotate(mvMatrix,mvMatrix, degToRad(0.0),[0,1,0]); // 3 y-axis rotation
        mat4.rotate(mvMatrix, mvMatrix, degToRad(plunge), [0, 0, 1]); // 4 z-axis rotation
        mat4.rotate(mvMatrix, mvMatrix, degToRad(-0.0), [0, 1, 0]); // 5 y-axis rotation
        mat4.rotate(mvMatrix, mvMatrix, degToRad(-0.0), [1, 0, 0]); // 6 x-axis rotation
        mat4.translate(mvMatrix, mvMatrix, dx1); // 1

        show_item(line);
    }
    mvPopMatrix();

    // North "Arrow" Line
    mvPushMatrix();
    {
        mat4.translate(mvMatrix,mvMatrix, vec3.fromValues(0.8,0.01,-0.8));
        show_item(north);
    }
    mvPopMatrix();
    // North "Arrow" Head
    mvPushMatrix();
    {
        mat4.translate(mvMatrix,mvMatrix, vec3.fromValues(0.95,0.01,-0.85));
        mat4.rotate(mvMatrix,mvMatrix, degToRad(-45.0),[0,1,0]); 
        show_item(north1);
    }
    mvPopMatrix();
    // North "Arrow" Head
    mvPushMatrix();
    {
        mat4.translate(mvMatrix,mvMatrix, vec3.fromValues(0.95,0.01,-0.75));
        mat4.rotate(mvMatrix,mvMatrix, degToRad(+45.0),[0,1,0]);
        show_item(north2);
    }
    mvPopMatrix();
}


var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        xRot += (xSpeed * elapsed) / 1000.0;
        yRot += (ySpeed * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}


function tick() {
    requestAnimFrame(tick);
    //handleKeys();
    drawScene();
    //animate();
}

function webGLStart() {
    var canvas = document.getElementById("lesson06-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    //gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );
    //gl.enable(gl.BLEND);
    //gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.DEPTH_TEST);

    //document.onkeydown = handleKeyDown;
    //document.onkeyup = handleKeyUp;

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    tick();
}
function update(id,val) {
    document.getElementById(id).value=val; 
}
