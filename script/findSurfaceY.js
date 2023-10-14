/**
 * Returns the surface Y coordinate at the given X coordinate
 * @param {number} x - X coordinate to check
 * @returns {number} - Y coordinate of the first tile below the given x coordinate that is not AIR or WATER
 */
function _findSurfaceY(x, world) {
  for (let y = world.rows - 1; y >= 0; y--) {
    if (
      !checkTile(
        x,
        y,
        ["AIR", "WATER"],
        world.rows,
        world.cols,
        world.tiles
      )
    ) return y;
  }
  return 0;
}