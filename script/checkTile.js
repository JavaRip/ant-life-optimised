/**
 * Returns whether a tile is legal and optionally whether it is in the mask
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string[]} mask - tile types that are allowed
 * @returns {boolean} - whether the tile is legal and allowed by the mask
 */
function checkTile(x, y, mask, rows, cols, tiles) {
  if (!legal(x, y, rows, cols)) return false;
  if (!mask) return true;
  return mask.includes(getTile(x, y, tiles));
}
