/**
 * Performs the action for a FUNGUS tile
 * FUNGUS falls down and has a chance to convert to adjacent PLANT tiles if underground
 */
function fungusAction(rows, cols, tiles, chunks, surfaceY, chunkSize, convertProb, x, y) {
  // // Destroyed by air
  // if (Math.random() <= KILL_PROB && this._exposedToSky(x, y)) {
  //   return world.setTile(x, y, "SAND");
  // }

  // when unsupported, move down
  if (
    checkTile(x, y - 1, ["AIR", "WATER"], rows, cols, tiles) &&
    touching(rows, cols, chunks, chunkSize, x, y, ["FUNGUS", "PLANT"]) < 2
  ) {
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

  // When underground and touching plant, convert to fungus
  if (y < surfaceY && Math.random() <= convertProb) {
    const tileSet = setOneTouching(
      rows,
      cols,
      tiles,
      chunks,
      chunkSize,
      x,
      y,
      "FUNGUS",
      ["PLANT"],
    );
    if (tileSet.changed) {
      return { tiles: tileSet.tiles, changed: true };
    }
  }

  return { tiles: tiles, changed: false };
}