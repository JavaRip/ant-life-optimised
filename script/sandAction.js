function sandAction(rows, cols, tiles, x, y) {
  // move down or diagonally down
  const bias = randomSign();
  const swapResOne = swapTiles(
    rows,
    cols,
    tiles,
    x,
    y,
    x,
    y - 1,
    ["AIR", "WATER"],
  );

  if (swapResOne.changed) {
    return swapResOne;
  }

  const swapResTwo = swapTiles(
    rows,
    cols,
    tiles,
    x,
    y,
    x + bias,
    y - 1,
    ["AIR", "WATER"]
  );

  if (swapResTwo.changed) {
    return swapResTwo;
  }

  return swapTiles(
    rows,
    cols,
    tiles,
    x,
    y,
    x - bias,
    y - 1,
    ["AIR", "WATER"]
  );
}