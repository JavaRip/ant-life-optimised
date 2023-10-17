/**
 * Performs the action for a PLANT tile
 * PLANT falls down when unsupported by adjacent PLANT tiles and has a chance to grow
 * Growth is less likely when touching other PLANT or FUNGUS tiles so they form narrow stems
 */
function plantAction(rows, cols, tilesIn, chunks, chunkSize, growProb, plantGrowMask, x, y) {
  let tiles = [...tilesIn]
  // when unsupported, move down
  if (
    checkTile(x, y - 1, ["AIR", "WATER"], rows, cols, tiles) &&
    touching(rows, cols, tiles, chunks, chunkSize, x, y, ["PLANT"]) < 2
  ) {
    const swapRes = swapTiles(rows, cols, tiles, x, y, x, y - 1);
    tiles = swapRes.tiles;
  }

  // chance to grow up/down or left/right or diagonal, reduced by nearby plant/fungus
  if (
    Math.random() <=
    growProb / (touching(rows, cols, tiles, chunks, chunkSize, x, y, ["PLANT", "FUNGUS"], 3) ** 2 + 1)
  ) {
    const bias = randomSign();
    const bias2 = randomSign();

    const tileSetOne = setTile(
      rows,
      cols,
      tiles,
      x,
      y + bias2,
      "PLANT",
      plantGrowMask,
    );

    tiles = tileSetOne.tiles;

    const tileSetTwo = setTile(
      rows,
      cols,
      tiles,
      x + bias,
      y + bias2,
      "PLANT",
      plantGrowMask,
    )

    tiles = tileSetTwo.tiles;

    if (tileSetOne.changed || tileSetTwo.changed) {
        return { tiles: tiles, changed: true };
    }
  }

  return { tiles: tiles, changed: false };
}
