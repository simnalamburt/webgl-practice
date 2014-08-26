// CommonJS style module & browserify support
if (typeof require === 'function' && typeof exports === 'object') {
  var Sylvester = require('sylvester');

  var Vector = Sylvester.Vector;
  var Matrix = Sylvester.Matrix;
  var $V = Sylvester.Vector.create;
  var $M = Sylvester.Matrix.create;

  Sylvester.makeLookAt      = makeLookAt
  Sylvester.makePerspective = makePerspective
  Sylvester.makeFrustum     = makeFrustum
  Sylvester.makeOrtho       = makeOrtho
}

// Make translation transform matrix
Matrix.Translation = function(v) {
  var r;
  switch(v.elements.length) {
  case 2:
    r = Matrix.I(3);
    r.elements[2][0] = v.elements[0];
    r.elements[2][1] = v.elements[1];
    return r;
  case 3:
    r = Matrix.I(4);
    r.elements[0][3] = v.elements[0];
    r.elements[1][3] = v.elements[1];
    r.elements[2][3] = v.elements[2];
    return r;
  }

  throw new Error('Invalid length for Translation', 'sylvester-utils.js', 18);
};

// return column-major flattened matrix in array form
Matrix.prototype.flatten = function() {
  var result = [];

  if (this.elements.length !== 0) {
    var cols = this.elements[0].length;
    for (var j = 0; j < cols; j++) {
      var rows = this.elements.length;
      for (var i = 0; i < rows; i++) {
        result.push(this.elements[i][j]);
      }
    }
  }

  return result;
};

// if Matrix is smaller or equal to 4x4: make it 4x4
// else: do nothing and return null
Matrix.prototype.ensure4x4 = function() {
  var dim = this.elements;
  var rows = dim.length;
  var cols = dim[0].length;

  if (rows === 4 && cols === 4) return this;
  if (rows > 4 || cols > 4) return null;

  var i, j;
  // Extending each rows
  for (i = 0; i < rows; ++i) {
    var row = dim[i];
    for (j = row.length; j < 4; ++j) {
      row.push( i === j ? 1 : 0 );
    }
  }

  // Making new rows
  switch(rows) {
  case 0:
    dim.push([1, 0, 0, 0]);
    /* falls through */
  case 1:
    dim.push([0, 1, 0, 0]);
    /* falls through */
  case 2:
    dim.push([0, 0, 1, 0]);
    /* falls through */
  case 3:
    dim.push([0, 0, 0, 1]);
  }

  return this;
};

// if matrix is 4x4: return 3x3 subset of it
// else: do nothing and return null
Matrix.prototype.make3x3 = function() {
  return this.elements.length === 4 && this.elements[0].length === 4 ?
    Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
      [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
      [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]) :
    null;
};

// return the vector in array form
Vector.prototype.flatten = function () { return this.elements; };

// make a viewing transformation (gluLookAt)
function makeLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
  var eye = $V([ex, ey, ez]);
  var center = $V([cx, cy, cz]);
  var up = $V([ux, uy, uz]);

  var z = eye.subtract(center).toUnitVector();
  var x = up.cross(z).toUnitVector();
  var y = z.cross(x).toUnitVector();

  var m = $M([[x.e(1), x.e(2), x.e(3), 0],
      [y.e(1), y.e(2), y.e(3), 0],
      [z.e(1), z.e(2), z.e(3), 0],
      [0, 0, 0, 1]]);

  var t = $M([[1, 0, 0, -ex],
      [0, 1, 0, -ey],
      [0, 0, 1, -ez],
      [0, 0, 0, 1]]);
  return m.x(t);
}

// make a perspective projection matrix (gluPerspective)
function makePerspective(fovy, aspect, znear, zfar) {
  var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
  var ymin = -ymax;
  var xmin = ymin * aspect;
  var xmax = ymax * aspect;

  return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}

// make a perspective matrix (glFrustum)
function makeFrustum(left, right, bottom, top, znear, zfar) {
  var X = 2*znear/(right-left);
  var Y = 2*znear/(top-bottom);
  var A = (right+left)/(right-left);
  var B = (top+bottom)/(top-bottom);
  var C = -(zfar+znear)/(zfar-znear);
  var D = -2*zfar*znear/(zfar-znear);

  return $M([[X, 0, A, 0],
      [0, Y, B, 0],
      [0, 0, C, D],
      [0, 0, -1, 0]]);
}

// make an orthographic matrix (glOrtho)
function makeOrtho(left, right, bottom, top, znear, zfar) {
  var tx = - (right + left) / (right - left);
  var ty = - (top + bottom) / (top - bottom);
  var tz = - (zfar + znear) / (zfar - znear);

  return $M([[2 / (right - left), 0, 0, tx],
      [0, 2 / (top - bottom), 0, ty],
      [0, 0, -2 / (zfar - znear), tz],
      [0, 0, 0, 1]]);
}
