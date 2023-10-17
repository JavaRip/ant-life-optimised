/**
 * Returns the tiles matching the mask that are in reach
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string[]} mask - tile types to check for
 * @param {number} radius - radius to check (1 means only adjacent tiles)
 * @returns {object[]} list of matching tiles in reach as {x, y} objects
 */
function touchingWhich(rows, cols, tiles, chunks, chunkSize, x, y, mask, radius = 1) {
  // If no chunks in range contain target, skip searching
  const threshold = checkTile(x, y, mask, rows, cols, tiles) ? 2 : 1;
  if (!checkChunks(
    rows,
    cols,
    chunkSize,
    chunks,
    x,
    y,
    mask,
    radius,
    threshold
  )) {
    return [];
  }

  const touching = [];
  forEachTile(
    rows,
    cols,
    x - radius,
    y - radius,
    x + radius,
    y + radius,
    function (a, b) {
      if (checkTile(a, b, mask, rows, cols, tiles) && (a !== x || b !== y))
        touching.push({ a, b });
    },
  );
  return touching;
}
