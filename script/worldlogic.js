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
        const trailUpdate = this._trailAction(
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

  /**
   * Performs the action for a TRAIL tile
   * TRAIL falls down but is destroyed on contact with anything except air.
   * TRAIL draws a random WORKER within range (if any) towards it. This is separate
   * from the WORKER action, so TRAIL lets WORKERs move faster than usual.
   */
  _trailAction(rows, cols, tiles, chunks, chunkSize, workerRange, walkMask, x, y) {
    let result = false;

    // when unsupported on all sides, move down but don't stack
    if (!climbable(rows, cols, tiles, chunks, x, y, chunkSize)) {
      if (checkTile(x, y - 1, "TRAIL", rows, cols, tiles)) {
        setTile(x, y, "AIR");
      } else {
        tiles = swapTiles(rows, cols, tiles, x, y, x, y - 1).tiles;
      }
    }

    // find a worker to draw
    const targets = touchingWhich(rows, cols, tiles, chunks, chunkSize, x, y, ["WORKER"], workerRange);
    if (!targets.length) {
      result = false;
    } else {
      // choose one at random
      const { a, b } = targets[randomIntInclusive(0, targets.length - 1)];

      // move worker towards if possible
      const desiredA = a + Math.sign(x - a);
      const desiredB = b + Math.sign(y - b);

      const climb = climbable(rows, cols, tiles, chunks, a, b, chunkSize);

      const swapResOne = swapTiles(rows, cols, tiles, a, b, desiredA, desiredB, walkMask);
      if (swapResOne.changed) {
        tiles = swapResOne.tiles;
        result = climb && swapResOne.changed;
      } else {
        const swapResTwo = swapTiles(rows, cols, tiles, a, b, a, desiredB, walkMask);
        if (swapResTwo.changed) {
          tiles = swapResTwo.tiles;
          result = climb && swapResTwo.changed;
        } else {
          const swapResThree = swapTiles(rows, cols, tiles, a, b, desiredA, b, walkMask);
          result = climb && swapResThree.changed;
        }
      }
    }

    // Instantly destroyed on contact with anything that moves
    // Note: this is done after drawing workers so it works when touching a surface
    // however, this means we have to check that its not been consumed yet
    if (
      checkTile(x, y, ["TRAIL"], rows, cols, tiles) && // check not consumed
      touching(rows, cols, tiles, chunks, chunkSize, x, y, ["AIR", "TRAIL"]) < 8
    ) {
      return setTile(rows, cols, tiles, x, y, "AIR");
    }
    return { tiles: tiles, changed: result };
  }

}
