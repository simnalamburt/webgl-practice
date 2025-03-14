import Sylvester from 'sylvester'
import 'sylvester-utils'

const { Matrix, Vector, makePerspective } = Sylvester

function bail(msg: string): never {
  throw Error(msg)
}

//
// Resize detection
//
let resized = true
window.addEventListener('resize', () => {
  resized = true
})

//
// Initialize WebGL2
//
const canvas = document.getElementById('screen')
if (!(canvas instanceof HTMLCanvasElement)) bail('Could not find canvas')
const gl = canvas.getContext('webgl2') ?? bail('canvas.getContext() failed')
gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.clearDepth(1.0)
gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LEQUAL)

// Compile shaders then link them into a program
const shaders = [
  [
    gl.VERTEX_SHADER,
    `
      attribute vec3 aVertexPosition;
      attribute vec4 aVertexColor;

      uniform mat4 uMV;
      uniform mat4 uP;

      varying lowp vec4 vColor;

      void main(void) {
        gl_Position = uP * uMV * vec4(aVertexPosition, 1.0);
        vColor = aVertexColor;
      }
    `,
  ],
  [
    gl.FRAGMENT_SHADER,
    `
      varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor;
      }
    `,
  ],
] as const
const program = gl.createProgram() ?? bail('gl.createProgram() failed')
for (const [type, code] of shaders) {
  const shader = gl.createShader(type) ?? bail('gl.createShader() failed')
  gl.shaderSource(shader, code)
  gl.compileShader(shader)
  gl.getShaderParameter(shader, gl.COMPILE_STATUS) ||
    bail(gl.getShaderInfoLog(shader) ?? 'unknown error')
  gl.attachShader(program, shader)
}
gl.linkProgram(program)
gl.getProgramParameter(program, gl.LINK_STATUS) ||
  bail(gl.getProgramInfoLog(program) ?? 'unknown error')
gl.useProgram(program)

// aVertexPosition
const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition')
gl.enableVertexAttribArray(aVertexPosition)
// aVertexColor
const aVertexColor = gl.getAttribLocation(program, 'aVertexColor')
gl.enableVertexAttribArray(aVertexColor)

function makeBuffer(gl: WebGL2RenderingContext, data: Iterable<number>) {
  const ret = gl.createBuffer() ?? bail('gl.createBuffer() failed')
  gl.bindBuffer(gl.ARRAY_BUFFER, ret)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
  return ret
}
const vb = makeBuffer(gl, [+1, +1, +0, -1, +1, +0, +1, -1, +0, -1, -1, +0])
const colorb = makeBuffer(gl, [1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1])

setInterval(() => {
  const mvMatrix = Matrix.Translation(Vector.create([0, 0, -6])).ensure4x4()
  const mvUniform = gl.getUniformLocation(program, 'uMV') ?? bail('No uMV')
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()))

  const pMatrix = makePerspective(45, 1, 0.1, 100.0)
  const pUniform = gl.getUniformLocation(program, 'uP') ?? bail('No uP')
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(pMatrix.flatten()))

  gl.bindBuffer(gl.ARRAY_BUFFER, vb)
  gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorb)
  gl.vertexAttribPointer(aVertexColor, 4, gl.FLOAT, false, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  if (resized) {
    if (gl.canvas.width !== canvas.clientWidth) {
      gl.canvas.width = canvas.clientWidth
    }
    if (gl.canvas.height !== canvas.clientHeight) {
      gl.canvas.height = canvas.clientHeight
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }
}, 15)
