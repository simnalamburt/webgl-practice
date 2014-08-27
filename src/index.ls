sylvester = require('sylvester')
;           require('sylvester-utils')

Matrix = sylvester.Matrix
$V = sylvester.Vector.create
makePerspective = sylvester.makePerspective



gl = \screen
|> document.getElementById
|> (canvas) ->
  try
    canvas.getContext(\webgl) ||
    canvas.getContext(\experimental-webgl)
  catch
    ...
<- (.call gl)

### Prepare the flags
flag =
  resized: yes

window.addEventListener \resize -> flag.resized = yes


### Clear the buffer
@clearColor 0.0 0.0 0.0 1.0
@clearDepth 1.0
@enable @DEPTH_TEST
@depthFunc @LEQUAL


### Initialize the shaders
makeShader = (shader, code) ~>
  @shaderSource shader, code
  @compileShader shader
  unless @getShaderParameter shader, @COMPILE_STATUS
    ...
  shader

vs = makeShader (@createShader @VERTEX_SHADER), do
  '''
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  varying lowp vec4 vColor;

  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
  }
  '''

fs = makeShader (@createShader @FRAGMENT_SHADER), do
  '''
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
  '''

# Create the shader program
program = @createProgram!
@attachShader program, vs
@attachShader program, fs
@linkProgram program

# If creating the shader program failed, abort
unless @getProgramParameter program, @LINK_STATUS
  ...

@useProgram program


### Create the attributes
makeAttr = (name) ~>
  attr = @getAttribLocation program, name
  @enableVertexAttribArray attr
  attr

vertexPositionAttribute = makeAttr \aVertexPosition
vertexColorAttribute = makeAttr \aVertexColor


### Create the buffers
makeBuffer = (data) ~>
  ret = @createBuffer!
  @bindBuffer @ARRAY_BUFFER, ret
  @bufferData @ARRAY_BUFFER, new Float32Array(data), @STATIC_DRAW
  ret

vb = makeBuffer do
  * +1  +1  +0
    -1  +1  +0
    +1  -1  +0
    -1  -1  +0

colorb = makeBuffer do
  * 1 1 1 1
    1 0 0 1
    0 1 0 1
    0 0 1 1


### Draw the scene periodically
<~ (foo) -> setInterval foo, 15

mvMatrix = Matrix.Translation($V [0 0 -6]).ensure4x4!
mvUniform = @getUniformLocation program, \uMVMatrix
@uniformMatrix4fv mvUniform, false, new Float32Array mvMatrix.flatten!

pMatrix = makePerspective 45 1 0.1 100.0
pUniform = @getUniformLocation program, \uPMatrix
@uniformMatrix4fv pUniform, false, new Float32Array pMatrix.flatten!

@bindBuffer @ARRAY_BUFFER, vb
@vertexAttribPointer vertexPositionAttribute, 3, @FLOAT, false, 0, 0

@bindBuffer @ARRAY_BUFFER, colorb
@vertexAttribPointer vertexColorAttribute, 4, @FLOAT, false, 0, 0

@clear @COLOR_BUFFER_BIT .|. @DEPTH_BUFFER_BIT
@drawArrays @TRIANGLE_STRIP, 0 4


### Post-draw works

if flag.resized
  let c = @canvas
    c.width = c.clientWidth if c.width != c.clientWidth
    c.height = c.clientHeight if c.height != c.clientHeight
    @viewport 0, 0, c.width, c.height
