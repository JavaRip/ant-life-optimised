/**
 * Swaps the tiles at the given coordinates if they match the mask
 * @param {number} x - x coordinate of first tile
 * @param {number} y - y coordinate of first tile
 * @param {number} a - x coordinate of second tile
 * @param {number} b - y coordinate of second tile
 * @param {string[]} mask - allowed type of second tile
 * @returns {boolean} - whether the tiles were swapped
 */
function swapTiles(rows, cols, tilesIn, x, y, a, b, mask = false) {
  const tiles = [...tilesIn];
  if (!checkTile(a, b, mask, rows, cols, tilesIn)) {
    return tiles;
  } else {
    const t1 = getTile(x, y, tilesIn);
    const t2 = getTile(a, b, tilesIn);

    const tilesOne = setTile(
      rows,
      cols,
      tilesIn,
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

    return tilesOut;
  }
}