/**
 * Sets all tiles within a given radius of a tile to a given type if they match the mask
 * @param {number} centerX - x coordinate of center tile
 * @param {number} centerY - y coordinate of center tile
 * @param {number} radius - radius of circle
 * @param {string} tile - type of tile to set
 * @param {string[]} mask - tile types that are allowed to be replaced
 */
function fillCircle(rows, cols, centerX, centerY, radius, tile, tiles, mask = []) {
  forEachTile(
    rows,
    cols,
    centerX - radius,
    centerY - radius,
    centerX + radius,
    centerY + radius,
    function (x, y) {
      if (mask.length && !checkTile(x, y, mask, rows, cols, tiles)) {
        return;
      }
      if (!pointWithinRadiusWasm(centerX, centerY, x, y, radius)) return;
      const result = setTile(rows, cols, tiles, x, y, tile);
      tiles = result.tiles;
    },
  );

  return tiles;
}