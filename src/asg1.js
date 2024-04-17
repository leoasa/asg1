// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;  // uniform 変数
  void main() {
    gl_FragColor = u_FragColor;
  }`;

//Globals
  var canvas;
  var gl;
  var a_Position;
  var u_FragColor;
  var u_Size;
  
  function setupGLContext() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl', { preserveDrawingBuffer: true });
  
    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

  }

  function connectVariablesToGLSL() {
  
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }

  }

  //Constants
  const POINT = 0;
  const TRIANGLE = 1;
  const CIRCLE = 2;

  //Globals related to UI elements 
  let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
  let g_selectedSize=5;
  let g_selectedType=POINT;
  let g_selectedSegments=10;
  
  //Add actions for HTML UI
  function addHTMLActions() {

    //Button Events (Shape Type)
    // document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    // document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
    document.getElementById('clear').onclick =function() { g_shapesList=[]; renderAllShapes(); };
    document.getElementById('4d').onclick=function() { draw4DCube(); };
    document.getElementById('pointButton').onclick = function() { g_selectedType=POINT; };
    document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE; };
    document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE; };


    //Slide Events 
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
    document.getElementById('segmentsSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });

  }

  function main() {
  
    setupGLContext();
    connectVariablesToGLSL();
    addHTMLActions();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;

  canvas.onmousemove = function(ev) { if(ev.buttons==1) { click(ev) }};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function click(ev) {

  let [x, y] = convertCoordinatesEventtoGL(ev);
    
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  renderAllShapes();

}

function draw4DCube() {

  //Inner Cube

  //Face 1
  var v1 = new Float32Array([
    0.2, 0.19,   -0.2, -0.2,   0.2, -0.2
  ]);
  var v2 = new Float32Array([
    -0.2, 0.19,   -0.2, -0.2,   0.2, 0.19
  ]);

  //Face 2

  var v3 = new Float32Array([
    -0.2, 0.2,   0.1, 0.4,   0.5, 0.4
  ]);

  var v4 = new Float32Array([
    -0.2, 0.2,   0.2, 0.2,   0.5, 0.4
  ]);

  //Edges for Face 3

  var v5 = new Float32Array([
    0.2, -0.2,   0.5, -0.02,   0.2, -0.19
  ]);

  var v6 = new Float32Array([
    0.5, 0.4,   0.5, -0.03,   0.49, 0.4
  ]);

  //Scale this down
  let scaleFactor = 1.5

  for (let i = 0; i <= 5; i++) {
    v1[i] /= scaleFactor;
    v2[i] /= scaleFactor;
    v3[i] /= scaleFactor;
    v4[i] /= scaleFactor;
    v5[i] /= scaleFactor;
    v6[i] /= scaleFactor;
  }

  //Outer Cube

  // Edge 1 
  var edge1 = new Float32Array([
    -0.5, -0.5,   -0.5, 0.5,   -0.49, 0.49
  ]);

  // Edge 2 
  var edge2 = new Float32Array([
    -0.5, 0.5,   0.5, 0.5,   -0.5, 0.49
  ]);

  // Edge 3 
  var edge3 = new Float32Array([
    -0.5, -0.5,   0.5, -0.5,   0.5, -0.49
  ]);


  // Edge 4 
  var edge4 = new Float32Array([
    0.5, -0.5,   0.5, 0.5,   0.49, -0.49
  ]);

  // Top Edge 1 (parallels bottom Edge 3)
  var edge5 = new Float32Array([
    -0.5, 0.5,   0, 0.7,   .9, 0.7
  ]);

  // Top Edge 2 (parallels bottom Edge 4)
  var edge6 = new Float32Array([
    -0.5, 0.5,   0.5, 0.5,   .9, 0.7
  ]);

  // Top Edge 3 (parallels bottom Edge 1)
  var edge7 = new Float32Array([
    0.5, -0.5,   0.5, 0.48,   .9, 0.68
  ]);

  // Top Edge 4 (parallels bottom Edge 2)
  var edge8 = new Float32Array([
    0.5, -0.5,   0.9, 0.68,   0.9, -0.3
  ]);

  // Edge 8 
  var edge9 = new Float32Array([
    v2[0], v2[1], edge5[0], edge5[1], v2[0]+.01, v2[1] +.02
  ]);

  var edge10 = new Float32Array([
    v3[2], v3[3], edge5[2], edge5[3], v3[2]+.01, v3[3] +.02
  ]);

  var edge11 = new Float32Array([
    v6[0], v6[1], edge6[4], edge6[5], v6[0]+.01, v6[1] +.02
  ]);

  var edge12 = new Float32Array([
    v5[2], v5[3], edge8[4], edge8[5], v5[2]+.01, v5[3] +.02
  ]);

  var edge13 = new Float32Array([
    v2[2], v2[3], edge5[0], edge5[1]-1, v2[2]+.01, v2[3] +.02
  ]);

  var edge14 = new Float32Array([
    v5[0], v5[1], edge8[0], edge8[1], v5[0]+.01, v5[1] +.02
  ]);

  var edge15 = new Float32Array([
    v4[2], v4[3], edge2[2], edge2[3], v4[2]+.01, v4[3] +.03
  ]);


  gl.clear(gl.COLOR_BUFFER_BIT);

  // Outer cube edges (drawn as very thin triangles, with a second point very close to the first one)
  gl.uniform4f(u_FragColor, 0.0, 0.5, 1.0, 1.0);
  // Pass the color of a point to u_FragColor variable
  gl.uniform1f(u_Size, 5);

  drawTriangle(v1);
  drawTriangle(v2);
  drawTriangle(v3);
  drawTriangle(v4);
  drawTriangle(v5);
  drawTriangle(v6);

  drawTriangle(edge1);
  drawTriangle(edge2);
  drawTriangle(edge3);
  drawTriangle(edge4);
  drawTriangle(edge5);
  drawTriangle(edge6);
  drawTriangle(edge7);
  drawTriangle(edge8);
  drawTriangle(edge9);
  drawTriangle(edge10);
  drawTriangle(edge11);
  drawTriangle(edge12);
  drawTriangle(edge13);
  drawTriangle(edge14);
  drawTriangle(edge15);


}

function convertCoordinatesEventtoGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);  

    return ([x, y]);
  }


function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

//   var len = g_points.length;
  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}
