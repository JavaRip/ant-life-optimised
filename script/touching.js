/**
 * Returns the number of tiles matching the mask that are in reach
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string[]} mask - tile types to check for
 * @param {number} radius - radius to check (1 means only adjacent tiles)
 * @returns {boolean} the number of matching tiles in reach
 */
function touching(rows, cols, tiles, chunks, chunkSize, x, y, mask, radius = 1) {
  return touchingWhich(
    rows,
    cols,
    tiles,
    chunks,
    chunkSize,
    x,
    y,
    mask,
    radius,
  ).length;
}