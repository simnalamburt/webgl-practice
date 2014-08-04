gl = \screen
|> document.getElementById
|> (canvas) ->
  try
    canvas.getContext(\webgl) ||
    canvas.getContext(\experimental-webgl)
  catch
    ...
<- (.call gl)

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

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  }
  '''

fs = makeShader (@createShader @FRAGMENT_SHADER), do
  '''
  void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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

vertexPositionAttribute = @getAttribLocation program, \aVertexPosition
@enableVertexAttribArray vertexPositionAttribute


### Create a vertex buffer
vertices =
  +1.0  +1.0  0.0
  -1.0  +1.0  0.0
  +1.0  -1.0  0.0
  -1.0  -1.0  0.0

vb = @createBuffer!
@bindBuffer @ARRAY_BUFFER, vb
@bufferData @ARRAY_BUFFER, new Float32Array(vertices), @STATIC_DRAW


### Draw the scene periodically
<~ (foo) -> setInterval foo, 15

mvMatrix = Matrix.Translation($V [0 0 -6]).ensure4x4!
mvUniform = @getUniformLocation program, \uMVMatrix
@uniformMatrix4fv mvUniform, false, new Float32Array mvMatrix.flatten!

pMatrix = makePerspective 45 1 0.1 100.0
pUniform = @getUniformLocation program, \uPMatrix
@uniformMatrix4fv pUniform, false, new Float32Array pMatrix.flatten!

@vertexAttribPointer vertexPositionAttribute, 3, @FLOAT, false, 0, 0

@clear @COLOR_BUFFER_BIT .|. @DEPTH_BUFFER_BIT
@bindBuffer @ARRAY_BUFFER, vb
@drawArrays @TRIANGLE_STRIP, 0 4
