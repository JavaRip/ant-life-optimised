/**
 * Returns the surface Y coordinate at the given X coordinate
 * @param {number} x - X coordinate to check
 * @returns {number} - Y coordinate of the first tile below the given x coordinate that is not AIR or WATER
 */
function _findSurfaceY(x, world) {
  for (let y = world.rows - 1; y >= 0; y--) {
    if (!world.checkTile(x, y, ["AIR", "WATER"])) return y;
  }
  return 0;
}