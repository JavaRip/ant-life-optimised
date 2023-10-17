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
        const corpseUpdate = corpseAction(world.rows, world.cols, world.tiles, x, y);
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
        return this._fungusAction(world, x, y);
      case 'QUEEN':
        return this._queenAction(world, x, y);
      case 'WORKER':
        return this._workerAction(world, x, y);
      case 'PEST':
        return this._pestAction(world, x, y);
      case 'EGG':
        return this._eggAction(world, x, y);
      case 'TRAIL':
        return this._trailAction(world, x, y);
      default:
        return false;
    }
  }

  /**
   * Performs the action for a FUNGUS tile
   * FUNGUS falls down and has a chance to convert to adjacent PLANT tiles if underground
   */
  _fungusAction(world, x, y) {
    // // Destroyed by air
    // if (Math.random() <= KILL_PROB && this._exposedToSky(x, y)) {
    //   return world.setTile(x, y, "SAND");
    // }

    // when unsupported, move down
    if (
      checkTile(x, y - 1, ["AIR", "WATER"], world.rows, world.cols, world.tiles) &&
      touching(world.rows, world.cols, world.chunks, CHUNK_SIZE, x, y, ["FUNGUS", "PLANT"]) < 2
    ) {
      return swapTiles(
        world.rows,
        world.cols,
        world.tiles,
        x,
        y,
        x,
        y - 1,
      );
    }

    // When underground and touching plant, convert to fungus
    if (y < world.surfaceY && Math.random() <= CONVERT_PROB) {
      if (setOneTouching(
        world.rows,
        world.cols,
        world.tiles,
        world.chunks,
        CHUNK_SIZE,
        x,
        y,
        "FUNGUS",
        ["PLANT"],
      )) {
        return true;
      }
    }

    return;
  }

  /**
   * Performs the action for a QUEEN tile
   * QUEEN falls down when unable to climb. When few FUNGUS tiles are nearby,
   * QUEEN moves randomly. When adjacent to FUNGUS QUEEN converts it to EGG.
   * Otherwise QUEEN moves towards closest FUNGUS if any are in range. QUEEN
   * will not convert FUNGUS if there are too few nearby to avoid extinction.
   */
  _queenAction(world, x, y) {
    // when unsupported on all sides, move down
    if (!climbable(world.rows, world.cols, world.tiles, x, y, world, CHUNK_SIZE)) {
      world.tiles = swapTiles(world.rows, world.cols, world.tiles, x, y, x, y - 1).tiles;
      return;
    }

    if (Math.random() <= QUEEN_SPEED) {
      // when few fungus nearby, move randomly
      if (touching(world.rows, world.cols, world.tiles, world.chunks, CHUNK_SIZE, x, y, ["FUNGUS"], QUEEN_RANGE) < QUEEN_FUNGUS_MIN) {
        world.tiles = moveRandom(world.rows, world.cols, world.tiles, x, y, WALK_MASK);
        return;
      }
      // when touching fungus, converts one to egg, else move any direction towards closest fungus
      const tileLaid = Math.random() <= EGG_LAY_PROB ? "EGG" : "AIR";

      const sotRes = setOneTouching(
        world.rows,
        world.cols,
        world.tiles,
        world.chunks,
        CHUNK_SIZE,
        x,
        y,
        tileLaid,
        ["FUNGUS"],
      );
      if (sotRes.changed) {
        return sotRes.tiles;
      }

      const sftRes = searchForTile(
        world.rows,
        world.cols,
        world.tiles,
        world.chunks,
        CHUNK_SIZE,
        x,
        y,
        ["FUNGUS"],
        QUEEN_RANGE,
        WALK_MASK
      );

      if (sftRes.changed) {
        return sftRes.tiles;
      }

      const mrRes = moveRandom(world.rows, world.cols, world.tiles, x, y, WALK_MASK);
      if (mrRes.changed) {
        return mrRes.tiles;
      }
    }
    return false;
  }

  /**
   * Performs the action for a WORKER tile
   * WORKER falls down when unable to climb and moves randomly.
   * When moving randomly, WORKER will push adjacent tiles, spreading them around.
   */
  _workerAction(world, x, y) {
    // when unsupported on all sides, move down
    if (!climbable(world.rows, world.cols, world.tiles, x, y, world, CHUNK_SIZE)) {
      return swapTiles(
        world.rows,
        world.cols,
        world.tiles,
        x,
        y,
        x,
        y - 1
      );
    }

    // move randomly
    return moveRandom(world.rows, world.cols, world.tiles, x, y, WALK_MASK, PUSH_MASK);
  }

  /**
   * Performs the action for a PEST tile
   * PESTS kill adjacent WORKER, QUEEN, and EGG tiles, seek out targets, or fly around randomly.
   * PESTS can be killed by adjacent WORKER tiles but usually win a 1-on-1 fight.
   */
  _pestAction(world, x, y) {
    // Destroyed by workers
    if (Math.random() <= KILL_PROB * touching(world.rows, world.cols, world.tiles, world.chunks, CHUNK_SIZE, x, y, ["WORKER"])) {
      const tileSet = setTile(world.rows, world.cols, world.tiles, x, y, "CORPSE");
      world.tiles = tileSet.tiles
      return tileSet.change
    }

    // Fight workers, queens, eggs
    // Note: this is asymmetric so groups of workers fight better than pests.
    // Pests are hit by all neighbouring workers but only hit one worker per tick.
    // But pests have a higher base attack chance so typically win 1 on 1.
    if (Math.random() <= KILL_PROB * 2) {
      if (setOneTouching(
        world.rows,
        world.cols,
        world.tiles,
        world.chunks,
        CHUNK_SIZE,
        x,
        y,
        "CORPSE",
        PEST_TARGET_MASK,
      )) {
        return true;
      }
    }

    // Chance to seek out targets
    // Note: low chance allows going around obstacles and also reduces lag
    if (
      Math.random() < PEST_SEEK_PROB &&
      searchForTile(
        world.rows,
        world.cols,
        world.tiles,
        world.chunks,
        world.chunkSize,
        x,
        y,
        PEST_TARGET_MASK,
        PEST_RANGE,
        WALK_MASK,
      )
    ) {
      return true;
    }
    // move randomly
    // Note: random movement uses a reduced tileset to avoid helping farm
    return moveRandom(world.rows, world.cols, world.tiles, x, y, ROAM_MASK);
  }

  /**
   * Performs the action for an EGG tile
   * EGG falls down and to the side and has a chance to hatch into a QUEEN or WORKER.
   */
  _eggAction(world, x, y) {
    // chance to hatch, else move down or diagonally down
    if (Math.random() <= EGG_HATCH_PROB) {
      // hatch into QUEEN or WORKER
      world.tiles = setTile(
        world.rows,
        world.cols,
        world.tiles,
        x,
        y,
        Math.random() < EGG_QUEEN_PROB ? "QUEEN" : "WORKER",
      ).tiles;
      world.ants++;
      return true;
    }
    const bias = randomSign();
    const swapResOne = swapTiles(world.rows, world.cols, world.tiles, x, y, x, y - 1, ["AIR", "WATER"]);
    if (swapResOne.changed) return swapResOne.tiles;

    const swapResTwo = swapTiles(world.rows, world.cols, world.tiles, x, y, x - bias, y - 1, ["AIR", "WATER"])
    if (swapResTwo.changed) return swapResTwo.tiles;

    return swapTiles(world.rows, world.cols, world.tiles, x, y, x + bias, y - 1, ["AIR", "WATER"])
  }

  /**
   * Performs the action for a TRAIL tile
   * TRAIL falls down but is destroyed on contact with anything except air.
   * TRAIL draws a random WORKER within range (if any) towards it. This is separate
   * from the WORKER action, so TRAIL lets WORKERs move faster than usual.
   */
  _trailAction(world, x, y) {
    let result = false;

    // when unsupported on all sides, move down but don't stack
    if (!climbable(world.rows, world.cols, world.tiles, x, y, world, CHUNK_SIZE)) {
      if (checkTile(x, y - 1, "TRAIL", world.rows, world.cols, world.tiles)) {
        setTile(x, y, "AIR");
      } else {
        world.tiles = swapTiles(world.rows, world.cols, world.tiles, x, y, x, y - 1).tiles;
      }
    }

    // find a worker to draw
    const targets = touchingWhich(world.rows, world.cols, world.tiles, world.chunks, CHUNK_SIZE, x, y, ["WORKER"], WORKER_RANGE);
    if (!targets.length) {
      result = false;
    } else {
      // choose one at random
      const { a, b } = targets[randomIntInclusive(0, targets.length - 1)];

      // move worker towards if possible
      const desiredA = a + Math.sign(x - a);
      const desiredB = b + Math.sign(y - b);

      const climb = climbable(world.rows, world.cols, world.tiles, a, b, world, CHUNK_SIZE);

      const swapResOne = swapTiles(world.rows, world.cols, world.tiles, a, b, desiredA, desiredB, WALK_MASK);
      if (swapResOne.changed) {
        world.tiles = swapResOne.tiles;
        result = climb && swapResOne.changed;
      } else {
        const swapResTwo = swapTiles(world.rows, world.cols, world.tiles, a, b, a, desiredB, WALK_MASK);
        if (swapResTwo.changed) {
          world.tiles = swapResTwo.tiles;
          result = climb && swapResTwo.changed;
        } else {
          const swapResThree = swapTiles(world.rows, world.cols, world.tiles, a, b, desiredA, b, WALK_MASK);
          result = climb && swapResThree.changed;
        }
      }
    }

    // Instantly destroyed on contact with anything that moves
    // Note: this is done after drawing workers so it works when touching a surface
    // however, this means we have to check that its not been consumed yet
    if (
      checkTile(x, y, ["TRAIL"], world.rows, world.cols, world.tiles) && // check not consumed
      touching(world.rows, world.cols, world.tiles, world.chunks, CHUNK_SIZE, x, y, ["AIR", "TRAIL"]) < 8
    ) {
      const tileSet = setTile(world.rows, world.cols, world.tiles, x, y, "AIR");
      world.tiles = tileSet.tiles;
      return tileSet.change;
    }
    return result;
  }

}
