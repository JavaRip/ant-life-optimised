/**
 * Runs a function on each tile within a given rectangle
 * @param {number} minX - minimum x coordinate
 * @param {number} minY - minimum y coordinate
 * @param {number} maxX - maximum x coordinate
 * @param {number} maxY - maximum y coordinate
 * @param {function} func - function to run on each tile
 */
function forEachTile(rows, cols, minX, minY, maxX, maxY, func) {
  for (let y = Math.max(minY, 0); y <= Math.min(maxY, rows - 1); y++) {
    for (let x = Math.max(minX, 0); x <= Math.min(maxX, cols - 1); x++) {
      func(x, y);
    }
  }
}