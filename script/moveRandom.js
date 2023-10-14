/**
 * Move in a random direction, switching places with the target tile
 * or pushing the tile in front if possible
 * @param {number} x - mover x coordinate
 * @param {number} y - mover y coordinate
 * @param {string[]} mask - tile types that can be swapped with
 * @param {boolean} pushMask - tile types that can be pushed
 * @returns {boolean} whether tiles were swapped
 */
function moveRandom(rows, cols, tilesIn, x, y, mask, pushMask = false) {
  const tiles = [...tilesIn];
  // determine direction
  const dx = randomIntInclusive(-1, 1);
  const dy = randomIntInclusive(-1, 1);

  // when moving into a pushable tile, swap the two tiles in front
  let newTiles;
  if (
      pushMask &&
      checkTile(x + dx, y + dy, pushMask, rows, cols, tiles)
    ) {
    // push less vertically than horizontally
    newTiles = swapTiles(rows, cols, tiles, x + dx, y + dy, x + dx + dx, y + dy, mask);
  } else {
    newTiles = tiles;
  }

  // swap with tile in front
  return swapTiles(
    rows,
    cols,
    newTiles,
    x,
    y,
    x + dx,
    y + dy,
    mask,
  );
}
