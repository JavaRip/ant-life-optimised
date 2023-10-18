/**
 * Perform the action for a tile if it has one
 * @param {number} x - X coordinate of tile
 * @param {number} y - Y coordinate of tile
 * @returns {boolean} - Whether the tile performed an action
 */
function doTileAction(
  rows,
  cols,
  tiles,
  chunks,
  chunkSize,
  killProb,
  evaporateProb,
  growProb,
  eggLayProb,
  convertProb,
  pestSeekProb,
  eggHatchProb,
  eggQueenProb,
  waterKillMask,
  plantGrowMask,
  walkMask,
  pushMask,
  pestTargetMask,
  roamMask,
  queenSpeed,
  queenRange,
  pestRange,
  workerRange,
  queenFungusMin,
  surfaceY,
  x,
  y,
) {
  const tile = getTile(x, y, tiles);
  switch (tile) {
    case 'SAND':
      const sandUpdate = sandAction(rows, cols, tiles, x, y);

      return sandUpdate;
    case 'CORPSE':
      return corpseAction(rows, cols, chunks, chunkSize, tiles, convertProb, x, y);
    case 'WATER':
      return waterAction(
        rows,
        cols,
        tiles,
        chunks,
        chunkSize,
        killProb,
        waterKillMask,
        evaporateProb,
        x,
        y,
      );
    case 'PLANT':
      return plantAction(
        rows,
        cols,
        tiles,
        chunks,
        chunkSize,
        growProb,
        plantGrowMask,
        x,
        y,
      );
    case 'FUNGUS':
      return fungusAction(
        rows,
        cols,
        tiles,
        chunks,
        surfaceY,
        chunkSize,
        convertProb,
        x,
        y,
      );
    case 'QUEEN':
      return queenAction(
        rows,
        cols,
        tiles,
        chunks,
        chunkSize,
        queenSpeed,
        queenRange,
        queenFungusMin,
        walkMask,
        eggLayProb,
        x,
        y,
      );
    case 'WORKER':
      return workerAction(
        rows,
        cols,
        tiles,
        chunks,
        chunkSize,
        walkMask,
        pushMask,
        x,
        y,
      );
    case 'PEST':
      return pestAction(
        rows,
        cols,
        tiles,
        chunks,
        chunkSize,
        pestTargetMask,
        pestSeekProb,
        pestRange,
        walkMask,
        roamMask,
        x,
        y,
      );
    case 'EGG':
      return eggAction(
        rows,
        cols,
        tiles,
        eggHatchProb,
        eggQueenProb,
        x,
        y,
      );
    case 'TRAIL':
      return trailAction(
        rows,
        cols,
        tiles,
        chunks,
        chunkSize,
        workerRange,
        walkMask,
        x,
        y,
      );
    default:
      return { tiles: tiles, changed: false };
  }
}