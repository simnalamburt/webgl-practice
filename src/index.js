var sylvester, Matrix, $V, makePerspective, gl;
sylvester = require("./lib/sylvester.js");
require("./lib/sylvester-utils.js");
Matrix = sylvester.Matrix;
$V = sylvester.Vector.create;
makePerspective = sylvester.makePerspective;
gl = (function (canvas) {
  var e;
  try {
    return (
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch (e$) {
    e = e$;
    throw Error("unimplemented");
  }
})(document.getElementById("screen"));
(function (it) {
  return it.call(gl);
})(function () {
  var flag,
    makeShader,
    vs,
    fs,
    program,
    makeAttr,
    vertexPositionAttribute,
    vertexColorAttribute,
    makeBuffer,
    vb,
    colorb,
    this$ = this;
  flag = {
    resized: true,
  };
  window.addEventListener("resize", function () {
    return (flag.resized = true);
  });
  this.clearColor(0.0, 0.0, 0.0, 1.0);
  this.clearDepth(1.0);
  this.enable(this.DEPTH_TEST);
  this.depthFunc(this.LEQUAL);
  makeShader = function (shader, code) {
    this$.shaderSource(shader, code);
    this$.compileShader(shader);
    if (!this$.getShaderParameter(shader, this$.COMPILE_STATUS)) {
      throw Error("unimplemented");
    }
    return shader;
  };
  vs = makeShader(
    this.createShader(this.VERTEX_SHADER),
    "attribute vec3 aVertexPosition;\nattribute vec4 aVertexColor;\n\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\n\nvarying lowp vec4 vColor;\n\nvoid main(void) {\n  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n  vColor = aVertexColor;\n}"
  );
  fs = makeShader(
    this.createShader(this.FRAGMENT_SHADER),
    "varying lowp vec4 vColor;\n\nvoid main(void) {\n  gl_FragColor = vColor;\n}"
  );
  program = this.createProgram();
  this.attachShader(program, vs);
  this.attachShader(program, fs);
  this.linkProgram(program);
  if (!this.getProgramParameter(program, this.LINK_STATUS)) {
    throw Error("unimplemented");
  }
  this.useProgram(program);
  makeAttr = function (name) {
    var attr;
    attr = this$.getAttribLocation(program, name);
    this$.enableVertexAttribArray(attr);
    return attr;
  };
  vertexPositionAttribute = makeAttr("aVertexPosition");
  vertexColorAttribute = makeAttr("aVertexColor");
  makeBuffer = function (data) {
    var ret;
    ret = this$.createBuffer();
    this$.bindBuffer(this$.ARRAY_BUFFER, ret);
    this$.bufferData(
      this$.ARRAY_BUFFER,
      new Float32Array(data),
      this$.STATIC_DRAW
    );
    return ret;
  };
  vb = makeBuffer([+1, +1, +0, -1, +1, +0, +1, -1, +0, -1, -1, +0]);
  colorb = makeBuffer([1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1]);
  return (function (foo) {
    return setInterval(foo, 15);
  })(function () {
    var mvMatrix, mvUniform, pMatrix, pUniform;
    mvMatrix = Matrix.Translation($V([0, 0, -6])).ensure4x4();
    mvUniform = this$.getUniformLocation(program, "uMVMatrix");
    this$.uniformMatrix4fv(
      mvUniform,
      false,
      new Float32Array(mvMatrix.flatten())
    );
    pMatrix = makePerspective(45, 1, 0.1, 100.0);
    pUniform = this$.getUniformLocation(program, "uPMatrix");
    this$.uniformMatrix4fv(
      pUniform,
      false,
      new Float32Array(pMatrix.flatten())
    );
    this$.bindBuffer(this$.ARRAY_BUFFER, vb);
    this$.vertexAttribPointer(
      vertexPositionAttribute,
      3,
      this$.FLOAT,
      false,
      0,
      0
    );
    this$.bindBuffer(this$.ARRAY_BUFFER, colorb);
    this$.vertexAttribPointer(
      vertexColorAttribute,
      4,
      this$.FLOAT,
      false,
      0,
      0
    );
    this$.clear(this$.COLOR_BUFFER_BIT | this$.DEPTH_BUFFER_BIT);
    this$.drawArrays(this$.TRIANGLE_STRIP, 0, 4);
    if (flag.resized) {
      return function (c) {
        if (c.width !== c.clientWidth) {
          c.width = c.clientWidth;
        }
        if (c.height !== c.clientHeight) {
          c.height = c.clientHeight;
        }
        return this.viewport(0, 0, c.width, c.height);
      }.call(this$, this$.canvas);
    }
  });
});
