/**
 * Returns whether a pair of coordinates is within the bounds of the map
 */
function legal(x, y, rows, cols) {
  return x >= 0 && y >= 0 && x < cols && y < rows;
}
