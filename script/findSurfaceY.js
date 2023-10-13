/**
 * Returns the surface Y coordinate at the given X coordinate
 * @param {number} x - X coordinate to check
 * @returns {number} - Y coordinate of the first tile below the given x coordinate that is not AIR or WATER
 */
function findSurfaceY(x, world, rows, cols) {
  for (let y = world.rows - 1; y >= 0; y--) {
    if (!checkTile(x, y, ["AIR", "WATER"], rows, cols, world)) {
      return y;
    }
  }
  return 0;
}