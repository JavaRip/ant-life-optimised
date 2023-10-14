/**
 * Builds a list of chunks and their tile counts
 */
function updateChunks(rows, cols, tileset, chunkSize, tiles, world) {
  const chunks = [];

  for (let cy = 0; cy < rows / chunkSize; cy++) {
    chunks.push([]);
    for (let cx = 0; cx < cols / chunkSize; cx++) {
      // Create chunk with zeroed counts for all tile types
      let blankChunk = {};
      for (let tile of Object.keys(tileset)) {
        blankChunk[tile] = 0;
      }
      chunks[cy].push(blankChunk);

      // Count tiles in chunk
      const cy0 = cy * chunkSize;
      const cx0 = cx * chunkSize;
      forEachTile(
        rows,
        cols,
        cx0,
        cy0,
        cx0 + chunkSize,
        cy0 + chunkSize,
        function (x, y) {
          chunks[cy][cx][getTile(x, y, tiles)]++;
        },
      );
    }
  }
  return chunks
}