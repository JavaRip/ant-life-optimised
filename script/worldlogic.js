class Worldlogic {
  constructor(world) {
    this.world = world;
  }

  doTileAction(x, y) {
    const actions = {
      SAND: this._sandAction,
      CORPSE: this._corpseAction,
      WATER: this._waterAction,
      PLANT: this._plantAction,
      FUNGUS: this._fungusAction,
      QUEEN: this._queenAction,
      WORKER: this._workerAction,
      PEST: this._pestAction,
      EGG: this._eggAction,
      TRAIL: this._trailAction,
    };

    const tile = this.world.getTile(x, y);
    if (actions.hasOwnProperty(tile)) {
      return actions[tile].call(this, x, y);
    } else {
      return false;
    }
  }

  _sandAction(x, y) {
    // move down or diagonally down
    const bias = randomSign();
    return (
      this.world.swapTiles(x, y, x, y - 1, ["AIR", "WATER"]) ||
      this.world.swapTiles(x, y, x + bias, y - 1, ["AIR", "WATER"]) ||
      this.world.swapTiles(x, y, x - bias, y - 1, ["AIR", "WATER"])
    );
  }

  _corpseAction(x, y) {
    // when touching plant, convert to plant
    if (Math.random() <= CONVERT_PROB * this._touching(x, y, ["PLANT"])) {
      return this.world.setTile(x, y, "PLANT");
    }

    // move down or diagonally down
    const bias = randomSign();
    return (
      this.world.swapTiles(x, y, x, y - 1, ["AIR"]) ||
      this.world.swapTiles(x, y, x - bias, y - 1, ["AIR"]) ||
      this.world.swapTiles(x, y, x + bias, y - 1, ["AIR"])
    );
  }

  _waterAction(x, y) {
    // chance to evaporate under sky or if air to left/right or near plant
    if (
      Math.random() <= EVAPORATE_PROB &&
      (this._exposedToSky(x, y) ||
        this.world.checkTile(x - 1, y, ["AIR"]) ||
        this.world.checkTile(x + 1, y, ["AIR"]) ||
        this._touching(x, y, ["PLANT"]))
    ) {
      return this.world.setTile(x, y, "AIR");
    }

    // move down or diagonally down or sideways
    const bias = randomSign();
    return (
      this.world.swapTiles(x, y, x, y - 1, ["AIR", "CORPSE"]) ||
      this.world.swapTiles(x, y, x + bias, y - 1, ["AIR", "CORPSE"]) ||
      this.world.swapTiles(x, y, x - bias, y - 1, ["AIR", "CORPSE"]) ||
      this.world.swapTiles(x, y, x + bias, y, ["AIR", "CORPSE"])
    );
  }

  _plantAction(x, y) {
    // when unsupported, move down
    if (
      this.world.checkTile(x, y - 1, ["AIR", "WATER"]) &&
      this._touching(x, y, ["PLANT"]) < 2
    ) {
      return this.world.swapTiles(x, y, x, y - 1);
    }

    // when touching fungus, convert to fungus
    if (Math.random() <= CONVERT_PROB * this._touching(x, y, ["FUNGUS"])) {
      return this.world.setTile(x, y, "FUNGUS");
    }

    // chance to grow up/down or left/right or diagonal
    if (
      Math.random() <=
      GROW_PROB / (this._touching(x, y, ["PLANT"], 3) ** 2 + 1)
    ) {
      const bias = randomSign();
      const bias2 = randomSign();
      return (
        this.world.setTile(x, y + bias2, "PLANT", PLANT_GROW_MASK) ||
        this.world.setTile(x + bias, y + bias2, "PLANT", PLANT_GROW_MASK)
        // this.world.setTile(x + bias, y, "PLANT", PLANT_GROW_MASK) ||
      );
    }
    return;
  }

  _fungusAction(x, y) {
    // Destroyed by air
    if (Math.random() <= KILL_PROB && this._exposedToSky(x, y)) {
      return this.world.setTile(x, y, "SAND");
    }
    return;
  }

  _queenAction(x, y) {
    // Destroyed by water
    if (Math.random() <= KILL_PROB * this._touching(x, y, ["WATER"])) {
      return this.world.setTile(x, y, "CORPSE");
    }
    // when touching fungus, converts one to egg, else move any direction towards closest fungus
    if (Math.random() <= QUEEN_SPEED) {
      return (
        this._setOneTouching(x, y, "EGG", ["FUNGUS"]) ||
        this._searchForTile(x, y, "FUNGUS", QUEEN_RANGE, WALK_MASK)
      );
    }
    return false;
  }

  _workerAction(x, y) {
    // Destroyed by water
    if (Math.random() <= KILL_PROB * this._touching(x, y, ["WATER"])) {
      return this.world.setTile(x, y, "CORPSE");
    }

    // when unsupported on all sides, move down
    if (!this._climbable(x, y)) {
      return this.world.swapTiles(x, y, x, y - 1);
    }

    // move randomly
    const dx = randomIntInclusive(-1, 1);
    const dy = randomIntInclusive(-1, 1);
    return this.world.swapTiles(x, y, x + dx, y + dy, WALK_MASK);
  }

  _pestAction(x, y) {
    // Destroyed by water and workers
    if (
      Math.random() <=
      KILL_PROB * this._touching(x, y, ["WATER", "WORKER"])
    ) {
      return this.world.setTile(x, y, "CORPSE");
    }

    // Fight workers, queens, eggs
    // Note: this is asymmetric so groups of workers fight better than pests.
    // Pests are hit by all neighbouring workers but only hit one worker per tick.
    // But pests have a higher base attack chance so typically win 1 on 1.
    if (Math.random() <= KILL_PROB * 2) {
      if (this._setOneTouching(x, y, "CORPSE", ["WORKER", "EGG", "QUEEN"])) {
        return true;
      }
    }

    // Seek out eggs
    if (this._searchForTile(x, y, PEST_TARGET_MASK, PEST_RANGE, WALK_MASK)) {
      return true;
    }
    // move randomly
    // Note: random movement uses a reduced tileset to avoid helping farm
    let dx = randomIntInclusive(-1, 1);
    let dy = randomIntInclusive(-1, 1);
    return this.world.swapTiles(x, y, x + dx, y + dy, ROAM_MASK);
  }

  _eggAction(x, y) {
    // Destroyed by water
    if (Math.random() <= KILL_PROB * this._touching(x, y, ["WATER"])) {
      return this.world.setTile(x, y, "CORPSE");
    }

    // chance to hatch, else move down or diagonally down
    if (Math.random() <= EGG_HATCH_PROB) {
      // hatch into QUEEN or WORKER
      this.world.setTile(
        x,
        y,
        Math.random() < EGG_QUEEN_PROB ? "QUEEN" : "WORKER",
      );
      this.world.ants++;
      return true;
    }
    const bias = randomSign();
    return (
      this.world.swapTiles(x, y, x, y - 1, ["AIR", "WATER"]) ||
      this.world.swapTiles(x, y, x - bias, y - 1, ["AIR", "WATER"]) ||
      this.world.swapTiles(x, y, x + bias, y - 1, ["AIR", "WATER"])
    );
  }

  _trailAction(x, y) {
    // Instantly destroyed on contact with anything that moves
    if (this._touching(x, y, ["AIR", "TRAIL"]) < 8) {
      return this.world.setTile(x, y, "AIR");
    }

    // when unsupported on all sides, move down but don't stack
    if (!this._climbable(x, y)) {
      if (this.world.checkTile(x, y - 1, "TRAIL")) {
        this.world.setTile(x, y, "AIR");
      } else {
        this.world.swapTiles(x, y, x, y - 1);
      }
    }

    // find a worker to draw
    const targets = this._touchingWhich(x, y, ["WORKER"], WORKER_RANGE);
    if (!targets.length) return false;
    const { a, b } = targets[randomIntInclusive(0, targets.length - 1)];

    // move worker towards if possible
    const desiredA = a + Math.sign(x - a);
    const desiredB = b + Math.sign(y - b);
    return (
      this._climbable(a, b) &&
      (this.world.swapTiles(a, b, desiredA, desiredB, WALK_MASK) ||
        this.world.swapTiles(a, b, a, desiredB, WALK_MASK) ||
        this.world.swapTiles(a, b, desiredA, b, WALK_MASK))
    );
  }

  _climbable(x, y) {
    return (
      !this.world.checkTile(x, y - 1, ["AIR", "TRAIL"]) ||
      this._touching(x, y, CLIMB_MASK) > 0
    );
  }

  _exposedToSky(x, y) {
    for (let i = y + 1; i < this.world.rows; i++) {
      if (!this.world.checkTile(x, i, ["AIR"])) return false;
    }
    return true;
  }

  _touching(x, y, mask, radius = 1) {
    return this._touchingWhich(x, y, mask, radius).length;
  }

  _touchingWhich(x, y, mask, radius = 1) {
    const world = this.world;
    const touching = [];
    this.world.forEachTile(
      x - radius,
      y - radius,
      x + radius,
      y + radius,
      function (a, b) {
        if (world.checkTile(a, b, mask) && (a !== x || b !== y))
          touching.push({ a, b });
      },
    );
    return touching;
  }

  _setOneTouching(x, y, tile, mask) {
    const targets = this._touchingWhich(x, y, mask);
    if (targets.length) {
      const target = targets[randomIntInclusive(0, targets.length - 1)];
      return this.world.setTile(target.a, target.b, tile);
    }
    return false;
  }

  _searchForTile(x, y, tile, radius, walkableMask = ["AIR"]) {
    for (let r = 1; r <= radius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (dx === 0 && dy === 0) continue;

          const a = x + dx;
          const b = y + dy;

          if (this.world.checkTile(a, b, tile)) {
            // found
            const desiredX = x + Math.sign(dx);
            const desiredY = y + Math.sign(dy);

            // move towards if possible
            if (
              this.world.swapTiles(x, y, desiredX, desiredY, walkableMask) ||
              this.world.swapTiles(x, y, x, desiredY, walkableMask) ||
              this.world.swapTiles(x, y, desiredX, y, walkableMask)
            ) {
              return true;
            }
          }
        }
      }
    }
    // none reachable found in radius
    return false;
  }
}
