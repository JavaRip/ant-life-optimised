/**
 * Performs the action for a PEST tile
 * PESTS kill adjacent WORKER, QUEEN, and EGG tiles, seek out targets, or fly around randomly.
 * PESTS can be killed by adjacent WORKER tiles but usually win a 1-on-1 fight.
 */
function pestAction(rows, cols, tiles, chunks, chunkSize, pestTargetMask, pestSeekProb, pestRange, walkMask, roamMask, x, y) {
  // Destroyed by workers
  if (Math.random() <= KILL_PROB * touching(rows, cols, tiles, chunks, chunkSize, x, y, ["WORKER"])) {
    return setTile(rows, cols, tiles, x, y, "CORPSE");
  }

  // Fight workers, queens, eggs
  // Note: this is asymmetric so groups of workers fight better than pests.
  // Pests are hit by all neighbouring workers but only hit one worker per tick.
  // But pests have a higher base attack chance so typically win 1 on 1.
  if (Math.random() <= KILL_PROB * 2) {
    const sotRes = setOneTouching(
      rows,
      cols,
      tiles,
      chunks,
      chunkSize,
      x,
      y,
      "CORPSE",
      pestTargetMask,
    )

    if (sotRes.changed) {
      return sotRes;
    }
  }

  // Chance to seek out targets
  // Note: low chance allows going around obstacles and also reduces lag
  if (
    Math.random() < pestSeekProb &&
    searchForTile(
      rows,
      cols,
      tiles,
      chunks,
      chunkSize,
      x,
      y,
      pestTargetMask,
      pestRange,
      walkMask,
    )
  ) {
    return true;
  }
  // move randomly
  // Note: random movement uses a reduced tileset to avoid helping farm
  return moveRandom(rows, cols, tiles, x, y, roamMask);
}