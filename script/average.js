/**
 * Calculate the average of an array of numbers
 * @param {number[]} arr - Array of numbers
 * @returns {number} - Average of the array
 */
function average(arr) {
  return arr.reduce((p, c) => p + c, 0) / arr.length;
}
