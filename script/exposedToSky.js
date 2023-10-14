/**
 * Returns whether a tile is exposed to the sky
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @returns {boolean} whether the tile is exposed to the sky
 */
function exposedToSky(rows, cols, tiles, x, y) {
  for (let i = y + 1; i < rows; i++) {
    if (!checkTile(x, i, ["AIR"], rows, cols, tiles)) {
      return false;
    }
  }
  return true;
}