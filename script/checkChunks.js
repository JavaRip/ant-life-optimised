/**
 * Returns whether chunks within a given distance of a tile contain a tile in the mask
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string[]} mask - tile types that are counted
 * @param {number} distance - distance from tile to check
 * @param {number} threshold - number of tiles in mask required to return true
 * @returns {boolean} - whether the chunks contain the required number of tiles
 */
function checkChunks(rows, cols, chunkSize, chunks, x, y, mask, distance = 0, threshold = 1) {
  if (!legal(x, y, rows, cols)) return false;
  if (!mask) return true;
  if (!threshold) return true;
  const gotChunks = getChunks(chunkSize, chunks, x, y, distance);
  let total = 0;
  for (let chunk of gotChunks) {
    for (let tile of mask) {
      total += chunk[tile];
      if (total > threshold) return true;
    }
  }
  return false;
}