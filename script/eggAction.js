/**
 * Performs the action for an EGG tile
 * EGG falls down and to the side and has a chance to hatch into a QUEEN or WORKER.
 */
function eggAction(rows, cols, tiles, eggHatchProb, eggQueenProb, x, y) {
  // chance to hatch, else move down or diagonally down
  if (Math.random() <= eggHatchProb) {
    // hatch into QUEEN or WORKER
    const tileSet = setTile(
      rows,
      cols,
      tiles,
      x,
      y,
      Math.random() < eggQueenProb ? "QUEEN" : "WORKER",
    );
    return { tiles: tileSet.tiles, changed: tileSet.change, antDelta: 1 };
  }
  const bias = randomSign();
  const swapResOne = swapTiles(rows, cols, tiles, x, y, x, y - 1, ["AIR", "WATER"]);
  if (swapResOne.changed) {
    return swapResOne;
  }

  const swapResTwo = swapTiles(rows, cols, tiles, x, y, x - bias, y - 1, ["AIR", "WATER"])
  if (swapResTwo.changed) {
    return swapResTwo;
  }

  return swapTiles(rows, cols, tiles, x, y, x + bias, y - 1, ["AIR", "WATER"])
}