/**
 * Swaps the tiles at the given coordinates if they match the mask
 * @param {number} x - x coordinate of first tile
 * @param {number} y - y coordinate of first tile
 * @param {number} a - x coordinate of second tile
 * @param {number} b - y coordinate of second tile
 * @param {string[]} mask - allowed type of second tile
 * @returns {boolean} - whether the tiles were swapped
 */
function swapTiles(rows, cols, tiles, x, y, a, b, mask = false) {
  if (!checkTile(a, b, mask, rows, cols, tiles)) {
    return { tiles: tiles, changed: false };
  } else {
    const t1 = getTile(x, y, tiles);
    const t2 = getTile(a, b, tiles);

    const tilesOne = setTile(
      rows,
      cols,
      tiles,
      a,
      b,
      t1,
    ).tiles;

    const tilesOut = setTile(
      rows,
      cols,
      tilesOne,
      x,
      y,
      t2,
    ).tiles;

    return { tiles: tilesOut, changed: true };
  }
}