//PA_GrowingTree.js
//Author: Leesha Maliakal

//Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position; \n' +
    'uniform mat4 u_ModelMatrix; \n' +
    'void main() { \n' +
    '  gl_Position = u_ModelMatrix * a_Position; \n' +
    '} \n';

//Fragment shader program
var FSHADER_SOURCE = 
    'void main() { \n' +
     '  gl_FragColor = vec4(0.5, 0.25, 0.0, 1.0);\n' +
    '}\n';

//Rotation angle rate (degrees/second)
var ANGLE_STEP = 30.0;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Write the positions of vertices to a vertex shader
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0.2, 1);

    // Get storage location of u_ModelMatrix
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Current rotation angle
    var currentAngle = 0.0;
    // Model matrix
    var modelMatrix = new Matrix4();

    //Draw elements
    var tick = function () {
        currentAngle = animate(currentAngle); //Update the rotation angle
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix); //Draw the triangle
        requestAnimationFrame(tick, canvas); //Request that the browser calls tick
    };
    tick();
}
    

//initVertexBuffers() sets up the vertex buffer object
function initVertexBuffers(gl) {
    var vertices = new Float32Array([
      0.00, 0.00, 0.00, 1.00,       //first triangle (x, y, z, w)
      -0.15, 0.00, 0.00, 1.00,
      0.00, 0.49, 0.00, 1.00,       
      0.20, 0.01, 0.00, 1.00,       //second triangle
      0.20, 0.50, 0.00, 1.00,
      0.01, 0.50, 0.00, 1.00,
    ]);
    var n = 6;   // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Assign the buffer object to a_Position variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    return n;
}

//draw() does all the draw functions of the program
function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw tree trunk-------------------------------//
    //Translate first half to bottom of canvas
        modelMatrix.setTranslate(0.0, 0.0, 0.0, 0.0);
        modelMatrix.translate(0.10, -1.00, 0.0);
        modelMatrix.scale(1.5, 1.0, 1.0);
    //Pass current matrix to vertex shaders:
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    //Draw the rectangle in the VBO
        gl.drawArrays(gl.TRIANGLES, 0, n);  //n is number of points, 0 is the position
    //Rotate second half to fit with other triangle to make rectangle
        modelMatrix.rotate(180, 0, 0, 1);
    //Translate second half to bottom of canvas
        modelMatrix.translate(0.15, -1.00, 0.0);
    //Pass current matrix to vertex shaders:
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    //Draw the rectangle in the VBO
        gl.drawArrays(gl.TRIANGLES, 0, n);  //n is number of points, 0 is the position

    //Draw Tier 1 branches-------------------------//
    //For loop to draw concurrent branches
        for (var i = -90; i <= 90; i += 30) {
           modelMatrix.setRotate(0, 0, 0, 1);
           modelMatrix.rotate(i, 0, 0, 1);
           modelMatrix.scale(0.4, 1.0, 1.0);
            //Pass current matrix to vertex shaders:
           gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            //Draw the rectangle in the VBO
           gl.drawArrays(gl.TRIANGLES, 0, n);  //n is number of points, 0 is the position      

        //Draw Tier 2 branches-------------------------//
           modelMatrix.scale(0.7, 0.4, 1.0);
           
           for (var j = 0; j <= 1; j++) {
               modelMatrix.rotate(20, 0, 0, 1);
               modelMatrix.translate(j, j, 0.0);
           }
            //Pass current matrix to vertex shaders:
           gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            //Draw the rectangle in the VBO
           gl.drawArrays(gl.TRIANGLES, 0, n);
            //Rotate for right side branches
           modelMatrix.rotate(currentAngle, 0, 0, 1);
            //Pass current matrix to vertex shaders:
           gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            //Draw the rectangle in the VBO
           gl.drawArrays(gl.TRIANGLES, 0, n);
        }
        pushMatrix(modelMatrix);

    

}
var g_last = Date.now();
function animate(angle) {
    //Calculate elapsed time
    
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;

    //Update current rotation angle (adjusted by elapsed time)
    //Limit angle to move smoothly between 60 and 120 degrees
    if (angle > 300 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
    if (angle < 270 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}


