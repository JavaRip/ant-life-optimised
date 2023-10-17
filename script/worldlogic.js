class Worldlogic {

  /**
   * Run the simulation for a single step
   */
  tick(world) {
    world.chunks = updateChunks(world.rows, world.cols, TILESET, CHUNK_SIZE, world.tiles, world);

    // Tile actions
    world.age += 1;
    // Randomly alternate left-to-right and right-to-left to avoid turn-order bias
    const bias = Math.random() <= 0.5;

    for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x < world.cols; x++) {
        const dx = bias ? x : world.cols - 1 - x;
        this._doTileAction(world, dx, y);
      }
    }

    // Rain
    if (this.age >= RAIN_FREQ && this.age % RAIN_FREQ <= RAIN_TIME) {
      const maxRain = randomIntInclusive(1, 5);
      const rainProgress = this.age % RAIN_FREQ;
      const rainCount =
        (Math.min(
          rainProgress ** 2 / 10000,
          maxRain,
          (RAIN_TIME - rainProgress) ** 2 / 10000,
        ) *
          this.cols) /
        100;
      this.doRain(rainCount);
    } // Pests (never at same time as rain)
    else if (this.age >= PEST_START && this.age % PEST_FREQ === 0) {
      this.doRain(Math.random(), "PEST");
    }
  }

  /**
   * Perform the action for a tile if it has one
   * @param {number} x - X coordinate of tile
   * @param {number} y - Y coordinate of tile
   * @returns {boolean} - Whether the tile performed an action
   */
  _doTileAction(world, x, y) {
    const tile = getTile(x, y, world.tiles);
    switch (tile) {
      case 'SAND':
        const sandUpdate = sandAction(world.rows, world.cols, world.tiles, x, y);

        if (sandUpdate.change) {
          world.tiles = sandUpdate.tiles;
        }

        return sandUpdate.change;
      case 'CORPSE':
        const corpseUpdate = corpseAction(world.rows, world.cols, world.chunks, CHUNK_SIZE, world.tiles, x, y);

        if (corpseUpdate.change) {
          world.tiles = corpseUpdate.tiles;
        }

        return corpseUpdate.change;
      case 'WATER':
        const waterUpdate = waterAction(world.rows, world.cols, world.tiles, x, y);

        if (waterUpdate.change) {
          world.tiles = waterUpdate.tiles;
        }

        return waterUpdate.change;
      case 'PLANT':
        const plantUpdate = plantAction(
          world.rows,
          world.cols,
          world.tiles,
          world.chunks,
          CHUNK_SIZE,
          GROW_PROB,
          PLANT_GROW_MASK,
          x,
          y,
        );

        if (plantUpdate.change) {
          world.tiles = plantUpdate.tiles;
        }

        return plantUpdate.change;
      case 'FUNGUS':
        const fungusUpdate = fungusAction(
          world.rows,
          world.cols,
          world.tiles,
          world.chunks,
          world.surfaceY,
          CHUNK_SIZE,
          CONVERT_PROB,
          x,
          y,
        );

        if (fungusUpdate.change) {
          world.tiles = fungusUpdate.tiles;
        }

        return fungusUpdate.change;
      case 'QUEEN':
        const queenUpdate = queenAction(
          world.rows,
          world.cols,
          world.tiles,
          world.chunks,
          CHUNK_SIZE,
          QUEEN_SPEED,
          QUEEN_RANGE,
          QUEEN_FUNGUS_MIN,
          WALK_MASK,
          EGG_LAY_PROB,
          x,
          y,
        );

        if (queenUpdate.change) {
          world.tiles = queenUpdate.tiles;
        }

        return queenUpdate.change;
      case 'WORKER':
        const workerUpdate = workerAction(
          world.rows,
          world.cols,
          world.tiles,
          world.chunks,
          CHUNK_SIZE,
          WALK_MASK,
          PUSH_MASK,
          x,
          y,
        );

        if (workerUpdate.change) {
          world.tiles = workerUpdate.tiles;
        }

        return workerUpdate.change;
      case 'PEST':
        const pestUpdate = pestAction(
          world.rows,
          world.cols,
          world.tiles,
          world.chunks,
          CHUNK_SIZE,
          PEST_TARGET_MASK,
          PEST_SEEK_PROB,
          PEST_RANGE,
          WALK_MASK,
          ROAM_MASK,
          x,
          y,
        );

        if (pestUpdate.change) {
          world.tiles = pestUpdate.tiles;
        }

        return pestUpdate.change;
      case 'EGG':
        return eggAction(
          world.rows,
          world.cols,
          world.tiles,
          EGG_HATCH_PROB,
          EGG_QUEEN_PROB,
          x,
          y,
        );
      case 'TRAIL':
        const trailUpdate = trailAction(
          world.rows,
          world.cols,
          world.tiles,
          world.chunks,
          CHUNK_SIZE,
          WORKER_RANGE,
          WALK_MASK,
          x,
          y,
        );

        if (trailUpdate.changed) {
          world.tiles = trailUpdate.tiles;
        }

        return trailUpdate.changed;
      default:
        return false;
    }
  }
}
