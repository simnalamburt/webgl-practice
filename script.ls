export function main
  gl = \screen
  |> document.getElementById
  |> (canvas) ->
    try
      canvas.getContext(\webgl) ||
      canvas.getContext(\experimental-webgl)
    catch
      null

  let @ = gl

    ### Initialized shaders
    makeShader = (shader, code) ~>
      @shaderSource shader, code
      @compileShader shader
      return null unless @getShaderParameter shader, @COMPILE_STATUS
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
    return unless @getProgramParameter program, @LINK_STATUS

    @useProgram program


    ### Clear screen
    @clearColor 0 0 0 1
    @enable @DEPTH_TEST
    @depthFunc @LEQUAL
    @clear @COLOR_BUFFER_BIT .|. @DEPTH_BUFFER_BIT
