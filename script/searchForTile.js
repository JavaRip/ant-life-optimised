/**
 * Move one step towards the nearest tile matching the target mask (if any are in range),
 * switching places with the next tile in that direction
 * @param {number} x - mover x coordinate
 * @param {number} y - mover y coordinate
 * @param {string[]} targetMask - tile types to move towards
 * @param {number} radius - maximum search range
 * @param {string[]} walkableMask - tile types that can be moved into
 * @returns {boolean} whether the tile moved
 */
function searchForTile(
    rows,
    cols,
    tiles,
    chunks,
    chunkSize,
    x,
    y,
    targetMask,
    radius,
    walkableMask = ["AIR"]
  ) {
  // If no chunks in range contain target, skip searching
  if (!checkChunks(rows, cols, chunkSize, chunks, x, y, targetMask, radius)) {
    return false;
  }

  for (let r = 1; r <= radius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (dx === 0 && dy === 0) continue;

        const a = x + dx;
        const b = y + dy;

        if (checkTile(a, b, targetMask, rows, cols, tiles)) {
          // found
          const desiredX = x + Math.sign(dx);
          const desiredY = y + Math.sign(dy);

          // move towards if possible
          const swappedTilesOne = swapTiles(rows, cols, tiles, x, y, desiredX, desiredY, walkableMask);
          if (swappedTilesOne) {
            return swappedTilesOne;
          }

          const swappedTilesTwo = swapTiles(rows, cols, tiles, x, y, x, desiredY, walkableMask);
          if (swappedTilesTwo) {
            return swappedTilesTwo;
          }

          const swappedTilesThree = swapTiles(rows, cols, tiles, x, y, desiredX, y, walkableMask);
          if (swappedTilesThree) {
            return swappedTilesThree;
          }
        }
      }
    }
  }

  // none reachable found in radius
  return false;
}