/**
  Class WORLD

  age:      int
  ants:     int
  chunks:   Array[Array[Chunk]]
  cols:     int
  rows:     int
  surfaceY: int
  tiles:    Array[Array[Tile]]
*/

/**
  Enum TILE

  Air
  Soil
  Sand
  Stone
  Worker
  Queen
  Egg
  Corpse
  Plant
  Water
  Fungus
  Pest
  Trail
*/

/**
  Chunk

  AIR:      int
  CORPSE:   int​
  EGG:      int
  FUNGUS:   int
  PEST:     int
  PLANT:    int
  QUEEN:    int
  SAND:     int
  SOIL:     int
  STONE:    int
  TRAIL:    int
  WATER:    int
  WORKER:   int
*/

/**
 * Contains the world state and methods for updating it
 * Tile logic is handled by Worldlogic
 * Tile generation is handled by Worldgen
 * @param {number} rows - Number of rows in the world
 * @param {number} cols - Number of columns in the world
 * @param {object} generatorSettings - Settings for the world generator
 */
class World {
  constructor(
    rows = ROW_COUNT,
    cols = COL_COUNT,
    age = 0,
    ants = 1,
    surfaceY = 80,
    tiles = [],
    chunks = [],
    ) {
    this.rows = rows;
    this.cols = cols;
    this.age = age;
    this.ants = ants;
    this.surfaceY = surfaceY;
    this.tiles = tiles;
    this.chunks = chunks;
  }

  /**
   * Spawn tiles at random locations on the top row
   * @param {number} count - number of tiles to spawn
   * @param {string} tile - tile type to spawn
   */
  doRain(count, tile = "WATER") {
    // allow for non-int chance
    let realCount = Math.floor(count);
    if (Math.random() <= count % 1) {
      realCount++;
    }
    for (let i = 0; i < realCount; i++) {
      const x = randomIntInclusive(0, this.cols - 1);
      this.setTile(x, this.rows - 1, tile, ["AIR"]);
    }
  }

  /**
   * Returns the tile at the given coordinates
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   */
  getTile(x, y) {
    return this.tiles[y][x];
  }

  /**
   * Replaces the tile at the given coordinates
   * If set, mask will only allow the tile to be set if it is in the mask
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @param {string} tile - tile type to set
   * @param {string[]} mask - tile types that are allowed to be replaced
   * @returns {boolean} - whether the tile was set
   */
  setTile(x, y, tile, mask = false) {
    if (!checkTile(x, y, mask, this.rows, this.cols, this)) {
      return false;
    } else {
      this.tiles[y][x] = tile;
      return true;
    }
  }

  /**
   * Returns whether chunks within a given distance of a tile contain a tile in the mask
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @param {string[]} mask - tile types that are counted
   * @param {number} distance - distance from tile to check
   * @param {number} threshold - number of tiles in mask required to return true
   * @returns {boolean} - whether the chunks contain the required number of tiles
   */
  checkChunks(x, y, mask, distance = 0, threshold = 1) {
    if (!legal(x, y, this.rows, this.cols)) return false;
    if (!mask) return true;
    if (!threshold) return true;
    const chunks = this._getChunks(x, y, distance);
    let total = 0;
    for (let chunk of chunks) {
      for (let tile of mask) {
        total += chunk[tile];
        if (total > threshold) return true;
      }
    }
    return false;
  }

  /**
   * Returns chunks within a given distance of a tile
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @param {number} distance - distance from tile to check
   * @returns {object[]} - chunks within distance of tile
   */
  _getChunks(x, y, distance) {
    const cxMin = Math.max(0, Math.floor((x - distance) / CHUNK_SIZE));
    const cyMin = Math.max(0, Math.floor((y - distance) / CHUNK_SIZE));
    const cxMax = Math.min(
      this.chunks[0].length - 1,
      Math.floor((x + distance) / CHUNK_SIZE),
    );
    const cyMax = Math.min(
      this.chunks.length - 1,
      Math.floor((y + distance) / CHUNK_SIZE),
    );

    let matches = [];
    for (let cx = cxMin; cx <= cxMax; cx++) {
      for (let cy = cyMin; cy <= cyMax; cy++) {
        matches.push(this.chunks[cy][cx]);
      }
    }
    return matches;
  }

  /**
   * Swaps the tiles at the given coordinates if they match the mask
   * @param {number} x - x coordinate of first tile
   * @param {number} y - y coordinate of first tile
   * @param {number} a - x coordinate of second tile
   * @param {number} b - y coordinate of second tile
   * @param {string[]} mask - allowed type of second tile
   * @returns {boolean} - whether the tiles were swapped
   */
  swapTiles(x, y, a, b, mask = false) {
    if (!checkTile(x, y, mask, this.rows, this.cols, this)) {
      return false;
    } else {
      const t1 = this.getTile(x, y);
      const t2 = this.getTile(a, b);
      this.setTile(a, b, t1);
      this.setTile(x, y, t2);
      return true;
    }
  }

  /**
   * Runs a function on each tile within a given rectangle
   * @param {number} minX - minimum x coordinate
   * @param {number} minY - minimum y coordinate
   * @param {number} maxX - maximum x coordinate
   * @param {number} maxY - maximum y coordinate
   * @param {function} func - function to run on each tile
   */
  forEachTile(minX, minY, maxX, maxY, func) {
    for (let y = Math.max(minY, 0); y <= Math.min(maxY, this.rows - 1); y++) {
      for (let x = Math.max(minX, 0); x <= Math.min(maxX, this.cols - 1); x++) {
        func(x, y);
      }
    }
  }

  /**
   * Sets all tiles within a given radius of a tile to a given type if they match the mask
   * @param {number} centerX - x coordinate of center tile
   * @param {number} centerY - y coordinate of center tile
   * @param {number} radius - radius of circle
   * @param {string} tile - type of tile to set
   * @param {string[]} mask - tile types that are allowed to be replaced
   */
  fillCircle(centerX, centerY, radius, tile, mask = []) {
    const me = this;
    this.forEachTile(
      centerX - radius,
      centerY - radius,
      centerX + radius,
      centerY + radius,
      function (x, y) {
        if (mask.length && !checkTile(x, y, mask, me.rows, me.cols, me)) return;
        if (!pointWithinRadius(centerX, centerY, x, y, radius)) return;
        me.setTile(x, y, tile);
      },
    );
  }

  /**
   * Sets all tiles within a given rectangle to a given type if they match the mask
   * @param {number} minX - minimum x coordinate
   * @param {number} minY - minimum y coordinate
   * @param {number} maxX - maximum x coordinate
   * @param {number} maxY - maximum y coordinate
   * @param {string} tile - type of tile to set
   * @param {string[]} mask - tile types that are allowed to be replaced
   */
  fillRectangle(minX, minY, maxX, maxY, tile, mask = []) {
    const me = this;
    this.forEachTile(minX, minY, maxX, maxY, function (x, y) {
      if (mask.length && !me.checkTile(x, y, mask, me.rows, me.cols, me)) return;
      me.setTile(x, y, tile);
    });
  }

  /**
   * Runs a performance benchmark
   * @returns {object} - object containing average TPS for a variety of tilesets
   */
  benchmark() {
    const scores = {};
    const allTiles = Object.keys(TILESET);

    // mixed tilesets
    scores["all"] = this._doBenchmark(allTiles, "all");
    scores["creatures"] = this._doBenchmark(
      ["PEST", "WORKER", "EGG", "QUEEN", "AIR"],
      "creatures",
    );

    // Each tile
    for (let tile of allTiles) {
      let mask = [tile];
      // Pad mask with AIR for more realistic behaviour and smoother performance
      for (let i = 0; i < 1 / BENCHMARK_DENSITY - 1; i++) {
        mask.push("AIR");
      }
      scores[tile] = this._doBenchmark(mask, tile);
    }

    const sorted = Object.fromEntries(
      Object.entries(scores).sort(([, a], [, b]) => a - b),
    );
    const result = JSON.stringify(sorted, null, 2);

    console.log(
      `Benchmarked TPS over ${BENCHMARK_BATCHES} runs of ${BENCHMARK_TICKS} ticks at density ${BENCHMARK_DENSITY}\n${result}`,
    );
    return sorted;
  }

  /**
   * Runs a performance benchmark for a given tile mask
   * @param {string[]} mask - tile types to benchmark
   * @param {string} name - name of the benchmark
   * @returns {number} - average TPS
   */
  _doBenchmark(mask, name) {
    console.log("Benchmarking", name);
    const batches = [];
    for (let batch = 0; batch < BENCHMARK_BATCHES; batch++) {
      this.worldgen.generateBenchmarkWorld(mask);
      const start = performance.now();
      for (let i = 0; i < BENCHMARK_TICKS; i++) {
        this.worldlogic.tick();
      }
      batches.push((performance.now() - start) / BENCHMARK_TICKS);
    }
    return Math.round(1000 / average(batches));
  }
}
