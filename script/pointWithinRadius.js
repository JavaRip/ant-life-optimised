/**
 * Returns whether a point is within a given radius of another point
 * @param {number} a - X coordinate of the first point
 * @param {number} b - Y coordinate of the first point
 * @param {number} x - X coordinate of the second point
 * @param {number} y - Y coordinate of the second point
 * @param {number} r - Radius
 * @returns {boolean} - Whether the first point is within the given radius of the second point
 */
function pointWithinRadius(a, b, x, y, r) {
  var dist = (a - x) * (a - x) + (b - y) * (b - y);
  return dist < r * r;
}

