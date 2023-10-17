/**
 * Performs the action for a WORKER tile
 * WORKER falls down when unable to climb and moves randomly.
 * When moving randomly, WORKER will push adjacent tiles, spreading them around.
 */
function workerAction(rows, cols, tiles, chunks, chunkSize, walkMask, pushMask, x, y) {
  // when unsupported on all sides, move down
  if (!climbable(rows, cols, tiles, chunks, x, y, chunkSize)) {
    return swapTiles(
      rows,
      cols,
      tiles,
      x,
      y,
      x,
      y - 1,
    );
  }

  // move randomly
  return moveRandom(rows, cols, tiles, x, y, walkMask, pushMask);
}