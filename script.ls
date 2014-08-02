export function main
  gl = \screen
  |> document.getElementById
  |> initWebGL

  gl.clearColor 0 0 0 1
  gl.enable gl.DEPTH_TEST
  gl.depthFunc gl.LEQUAL
  gl.clear gl.COLOR_BUFFER_BIT .|. gl.DEPTH_BUFFER_BIT

function initWebGL canvas
  try
    gl = canvas.getContext(\webgl) || canvas.getContext(\experimental-webgl)
  gl ? null
