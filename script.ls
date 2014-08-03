export function main
  gl = \screen
  |> document.getElementById
  |> initGL

  let @ = gl
    @clearColor 0 0 0 1
    @enable @DEPTH_TEST
    @depthFunc @LEQUAL
    @clear @COLOR_BUFFER_BIT .|. @DEPTH_BUFFER_BIT

function initGL canvas
  try
    canvas.getContext(\webgl) ||
    canvas.getContext(\experimental-webgl)
  catch
    null
