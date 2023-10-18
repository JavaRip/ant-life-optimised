/**
 * Performs the action for a WATER tile
 * WATER falls down and to the side, evaporates under sky or if air to
 * left/right or near plant, and kills neighbouring creatures
 */
function waterAction(
    rows,
    cols,
    tiles,
    chunks,
    chunkSize,
    killProb,
    waterKillMask,
    evaporateProb,
    x,
    y,
  ) {
  // chance to kill neighbouring creatures
  if (
    Math.random() <= killProb &&
    setOneTouching(rows, cols, tiles, chunks, chunkSize, x, y, "CORPSE", waterKillMask)
  ) {
    return setTile(rows, cols, tiles, x, y, "AIR");
  }

  // chance to evaporate under sky or if air to left/right or near plant
  if (
    Math.random() <= evaporateProb &&
    (exposedToSky(rows, cols, tiles, x, y) ||
      checkTile(x - 1, y, ["AIR"], rows, cols, tiles) ||
      checkTile(x + 1, y, ["AIR"], rows, cols, tiles) ||
      touching(rows, cols, tiles, chunks, chunkSize, x, y, ["PLANT"]))
  ) {
    return setTile(rows, cols, tiles, x, y, "AIR");
  }

  // move down or diagonally down or sideways
  const bias = randomSign();
  const swapResOne = swapTiles(rows, cols, tiles, x, y, x, y - 1, ["AIR", "CORPSE"]);
  if (swapResOne.changed) {
    return swapResOne;
  }

  const swapResTwo = swapTiles(rows, cols, tiles, x, y, x + bias, y - 1, ["AIR", "CORPSE"]);
  if (swapResTwo.changed) {
    return swapResTwo;
  }

  const swapResThree = swapTiles(rows, cols, tiles, x, y, x - bias, y - 1, ["AIR", "CORPSE"])
  if (swapResThree.changed) {
    return swapResThree;
  }

  return swapTiles(rows, cols, tiles, x, y, x + bias, y, ["AIR", "CORPSE"]);
}
