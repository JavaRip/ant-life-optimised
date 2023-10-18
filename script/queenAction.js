/**
 * Performs the action for a QUEEN tile
 * QUEEN falls down when unable to climb. When few FUNGUS tiles are nearby,
 * QUEEN moves randomly. When adjacent to FUNGUS QUEEN converts it to EGG.
 * Otherwise QUEEN moves towards closest FUNGUS if any are in range. QUEEN
 * will not convert FUNGUS if there are too few nearby to avoid extinction.
 */
function queenAction(rows, cols, tiles, chunks, chunkSize, queenSpeed, queenRange, queenFungusMin, walkMask, eggLayProb, x, y) {
  // when unsupported on all sides, move down
  if (!climbable(rows, cols, tiles, chunks, x, y, chunkSize)) {
    return swapTiles(rows, cols, tiles, x, y, x, y - 1);
  }

  if (Math.random() <= queenSpeed) {
    // when few fungus nearby, move randomly
    if (touching(rows, cols, tiles, chunks, chunkSize, x, y, ["FUNGUS"], queenRange) < queenFungusMin) {
      return moveRandom(rows, cols, tiles, x, y, walkMask);
    }
    // when touching fungus, converts one to egg, else move any direction towards closest fungus
    const tileLaid = Math.random() <= eggLayProb ? "EGG" : "AIR";

    const sotRes = setOneTouching(
      rows,
      cols,
      tiles,
      chunks,
      chunkSize,
      x,
      y,
      tileLaid,
      ["FUNGUS"],
    );

    if (sotRes.changed) {
      return sotRes;
    }

    const sftRes = searchForTile(
      rows,
      cols,
      tiles,
      chunks,
      chunkSize,
      x,
      y,
      ["FUNGUS"],
      queenRange,
      walkMask
    );

    if (sftRes.changed) {
      return sftRes;
    }

    const mrRes = moveRandom(rows, cols, tiles, x, y, walkMask);
    if (mrRes.changed) {
      return mrRes;
    }
  }
  return { tiles: tiles, changed: false };
}