/**
 * Returns chunks within a given distance of a tile
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {number} distance - distance from tile to check
 * @returns {object[]} - chunks within distance of tile
 */
function getChunks(chunkSize, chunks, x, y, distance) {
  const cxMin = Math.max(0, Math.floor((x - distance) / chunkSize));
  const cyMin = Math.max(0, Math.floor((y - distance) / chunkSize));
  const cxMax = Math.min(
    chunks[0].length - 1,
    Math.floor((x + distance) / chunkSize),
  );
  const cyMax = Math.min(
    chunks.length - 1,
    Math.floor((y + distance) / chunkSize),
  );

  let matches = [];
  for (let cx = cxMin; cx <= cxMax; cx++) {
    for (let cy = cyMin; cy <= cyMax; cy++) {
      matches.push(chunks[cy][cx]);
    }
  }
  return matches;
}