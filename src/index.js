import { Matrix, Vector, makePerspective } from 'sylvester'
import 'sylvester-utils'

const $V = Vector.create
const canvas = document.getElementById('screen')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let resized = true

window.addEventListener('resize', () => {
  resized = true
})
gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.clearDepth(1.0)
gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LEQUAL)

function makeShader(shader, code) {
  gl.shaderSource(shader, code)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw Error('unimplemented')
  }
  return shader
}

const vs = makeShader(
  gl.createShader(gl.VERTEX_SHADER),
  `
    attribute vec3 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      vColor = aVertexColor;
    }
  `
)

const fs = makeShader(
  gl.createShader(gl.FRAGMENT_SHADER),
  `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `
)

const program = gl.createProgram()
gl.attachShader(program, vs)
gl.attachShader(program, fs)
gl.linkProgram(program)
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw Error('unimplemented')
}
gl.useProgram(program)

function makeAttr(name) {
  const attr = gl.getAttribLocation(program, name)
  gl.enableVertexAttribArray(attr)
  return attr
}
const vertexPositionAttribute = makeAttr('aVertexPosition')
const vertexColorAttribute = makeAttr('aVertexColor')

function makeBuffer(data) {
  const ret = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, ret)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
  return ret
}

const vb = makeBuffer([+1, +1, +0, -1, +1, +0, +1, -1, +0, -1, -1, +0])
const colorb = makeBuffer([1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1])
setInterval(render, 15)

function render() {
  const mvMatrix = Matrix.Translation($V([0, 0, -6])).ensure4x4()
  const mvUniform = gl.getUniformLocation(program, 'uMVMatrix')
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()))

  const pMatrix = makePerspective(45, 1, 0.1, 100.0)
  const pUniform = gl.getUniformLocation(program, 'uPMatrix')
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(pMatrix.flatten()))

  gl.bindBuffer(gl.ARRAY_BUFFER, vb)
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorb)
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  if (resized) {
    if (gl.canvas.width !== gl.canvas.clientWidth) {
      gl.canvas.width = gl.canvas.clientWidth
    }
    if (gl.canvas.height !== gl.canvas.clientHeight) {
      gl.canvas.height = gl.canvas.clientHeight
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }
}
