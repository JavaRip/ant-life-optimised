/**
 * Sets one random tile matching the mask that is in reach to the given tile
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string} tile - tile type to set
 * @param {string[]} mask - tile types allowed to be replaced
 * @returns {boolean} whether a tile was replaced
 */
function setOneTouching(rows, cols, tiles, chunks, chunkSize, x, y, tile, mask) {
  const targets = touchingWhich(
    rows,
    cols,
    tiles,
    chunks,
    chunkSize,
    x,
    y,
    mask,
    1,
  );
  if (targets.length) {
    const target = targets[randomIntInclusive(0, targets.length - 1)];
    const tileSet = setTile(
      rows,
      cols,
      tiles,
      target.a,
      target.b,
      tile,
    );

    return tileSet;
  }
  return { tiles: tiles, change: false };
}