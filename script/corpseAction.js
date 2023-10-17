/**
 * Performs the action for a CORPSE tile
 * CORPSE falls down and to the side and has a chance to be converted by adjacent PLANT tiles
 */
function corpseAction(rows, cols, chunks, chunkSize, tiles, convertProb, x, y) {
  // when touching plant, convert to plant
  if (Math.random() <= convertProb * touching(rows, cols, tiles, chunks, chunkSize, x, y, ["PLANT"])) {
    // return { tiles, change } and set world state in calling function
    return setTile(rows, cols, tiles, x, y, "PLANT");
  }

  // move down or diagonally down
  const bias = randomSign();
  const swapResOne = swapTiles(rows, cols, tiles, x, y, x, y - 1, ["AIR"]);
  if (swapResOne.changed) {
    return swapResOne;
  }

  const swapResTwo = swapTiles(rows, cols, tiles, x, y, x - bias, y - 1, ["AIR"]);
  if (swapResTwo.changed) {
    return swapResTwo;
  }

  return swapTiles(rows, cols, tiles, x, y, x + bias, y - 1, ["AIR"]);
}