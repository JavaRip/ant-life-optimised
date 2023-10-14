/**
 * Replaces the tile at the given coordinates
 * If set, mask will only allow the tile to be set if it is in the mask
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string} tile - tile type to set
 * @param {string[]} mask - tile types that are allowed to be replaced
 * @returns {boolean} - whether the tile was set
 */
function setTile(rows, cols, tiles, x, y, tile, mask = false) {
  if (!checkTile(x, y, mask, rows, cols, tiles)) {
    return { tiles: tiles, change: false };
  } else {
    tiles[y][x] = tile;
    return { tiles: tiles, change: true };
  }
}