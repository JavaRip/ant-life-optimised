/**
 * Spawn tiles at random locations on the top row
 * @param {number} count - number of tiles to spawn
 * @param {string} tile - tile type to spawn
 */
function doRain(rows, cols, tiles, count, tile = "WATER") {
  // allow for non-int chance
  let realCount = Math.floor(count);

  if (Math.random() <= count % 1) {
    realCount++;
  }

  let changed = false;
  for (let i = 0; i < realCount; i++) {
    const x = randomIntInclusive(0, cols - 1);
    const tileSet = setTile(
      rows,
      cols,
      tiles,
      x,
      rows - 1,
      tile,
      ["AIR"],
    );

    tiles = tileSet.tiles;
    if (tileSet.changed) {
      changed = true;
    }
  }
  return { tiles: tiles, changed: changed };
}