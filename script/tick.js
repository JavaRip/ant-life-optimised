/**
 * Run the simulation for a single step
 */
function tick(world) {
  world.chunks = updateChunks(
    world.rows,
    world.cols,
    TILESET,
    CHUNK_SIZE,
    world.tiles,
    world,
  );

  // Tile actions
  world.age += 1;
  // Randomly alternate left-to-right and right-to-left to avoid turn-order bias
  const bias = Math.random() <= 0.5;

  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const dx = bias ? x : world.cols - 1 - x;
      world.tiles = doTileAction(
        world.rows,
        world.cols,
        world.tiles,
        world.chunks,
        CHUNK_SIZE,
        KILL_PROB,
        EVAPORATE_PROB,
        GROW_PROB,
        EGG_LAY_PROB,
        CONVERT_PROB,
        PEST_SEEK_PROB,
        EGG_HATCH_PROB,
        EGG_QUEEN_PROB,
        WATER_KILL_MASK,
        PLANT_GROW_MASK,
        WALK_MASK,
        PUSH_MASK,
        PEST_TARGET_MASK,
        ROAM_MASK,
        QUEEN_SPEED,
        QUEEN_RANGE,
        PEST_RANGE,
        WORKER_RANGE,
        QUEEN_FUNGUS_MIN,
        world.surfaceY,
        dx,
        y,
      ).tiles;
    }
  }

  // Rain
  if (world.age >= RAIN_FREQ && world.age % RAIN_FREQ <= RAIN_TIME) {
    const maxRain = randomIntInclusive(1, 5);
    const rainProgress = world.age % RAIN_FREQ;
    const rainCount =
      (Math.min(
        rainProgress ** 2 / 10000,
        maxRain,
        (RAIN_TIME - rainProgress) ** 2 / 10000,
      ) *
        world.cols) /
      100;
    doRain(world.rows, world.cols, world.tiles, rainCount);
  } // Pests (never at same time as rain)
  else if (world.age >= PEST_START && world.age % PEST_FREQ === 0) {
    world.tiles = doRain(world.rows, world.cols, world.tiles, Math.random(), "PEST").tiles;
  }

  return { tiles: world.tiles, age: world.age };
}