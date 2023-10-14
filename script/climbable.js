/**
 * Returns whether a tile is climbable
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @returns {boolean} whether the tile is climbable
 */
function climbable(rows, cols, tiles, x, y, world, worldlogic) {
  return (
    !checkTile(x, y - 1, ["AIR", "TRAIL"], rows, cols, tiles) ||
    worldlogic._touching(world, x, y, CLIMB_MASK) > 0
  );
}