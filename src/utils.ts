export function bail(msg: string): never {
  throw Error(msg)
}

export function matrixPerspective(
  fov: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array {
  const f = 1 / Math.tan(fov / 2)

  // biome-ignore format: This is perfectly readable
  return new Float32Array([
    f / aspect,   0,  0,                              +0,
    0,            f,  0,                              +0,
    0,            0,  (far + near) / (near - far),    -1,
    0,            0,  2 * far * near / (near - far),  +0,
  ])
}

export function matrixTranslation(
  x: number,
  y: number,
  z: number,
): Float32Array {
  // biome-ignore format: This is perfectly readable
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,
  ])
}
