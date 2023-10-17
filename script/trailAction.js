/**
 * Performs the action for a TRAIL tile
 * TRAIL falls down but is destroyed on contact with anything except air.
 * TRAIL draws a random WORKER within range (if any) towards it. This is separate
 * from the WORKER action, so TRAIL lets WORKERs move faster than usual.
 */
function trailAction(rows, cols, tiles, chunks, chunkSize, workerRange, walkMask, x, y) {
  let result = false;

  // when unsupported on all sides, move down but don't stack
  if (!climbable(rows, cols, tiles, chunks, x, y, chunkSize)) {
    if (checkTile(x, y - 1, "TRAIL", rows, cols, tiles)) {
      setTile(x, y, "AIR");
    } else {
      tiles = swapTiles(rows, cols, tiles, x, y, x, y - 1).tiles;
    }
  }

  // find a worker to draw
  const targets = touchingWhich(rows, cols, tiles, chunks, chunkSize, x, y, ["WORKER"], workerRange);
  if (!targets.length) {
    result = false;
  } else {
    // choose one at random
    const { a, b } = targets[randomIntInclusive(0, targets.length - 1)];

    // move worker towards if possible
    const desiredA = a + Math.sign(x - a);
    const desiredB = b + Math.sign(y - b);

    const climb = climbable(rows, cols, tiles, chunks, a, b, chunkSize);

    const swapResOne = swapTiles(rows, cols, tiles, a, b, desiredA, desiredB, walkMask);
    if (swapResOne.changed) {
      tiles = swapResOne.tiles;
      result = climb && swapResOne.changed;
    } else {
      const swapResTwo = swapTiles(rows, cols, tiles, a, b, a, desiredB, walkMask);
      if (swapResTwo.changed) {
        tiles = swapResTwo.tiles;
        result = climb && swapResTwo.changed;
      } else {
        const swapResThree = swapTiles(rows, cols, tiles, a, b, desiredA, b, walkMask);
        result = climb && swapResThree.changed;
      }
    }
  }

  // Instantly destroyed on contact with anything that moves
  // Note: this is done after drawing workers so it works when touching a surface
  // however, this means we have to check that its not been consumed yet
  if (
    checkTile(x, y, ["TRAIL"], rows, cols, tiles) && // check not consumed
    touching(rows, cols, tiles, chunks, chunkSize, x, y, ["AIR", "TRAIL"]) < 8
  ) {
    return setTile(rows, cols, tiles, x, y, "AIR");
  }
  return { tiles: tiles, changed: result };
}
