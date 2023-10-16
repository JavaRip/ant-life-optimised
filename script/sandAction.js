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
    return swapResOne.tiles;
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
    return swapResTwo.tiles;
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
  ).tiles;
}