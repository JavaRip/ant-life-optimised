const { KILL_PROB, EVAPORATE_PROB } = require("./definitions");

/**
 * Contains the world state and methods for updating it
 * Tile logic is handled by Worldlogic
 * Tile generation is handled by Worldgen
 * @param {number} rows - Number of rows in the world
 * @param {number} cols - Number of columns in the world
 * @param {object} generatorSettings - Settings for the world generator
 */
class World {
  constructor(rows = ROW_COUNT, cols = COL_COUNT, generatorSettings = {}) {
    const age = 0;
    const ants = 0;
    const wasmTilset = Object.values(TILESET);
    this.wasmWorld = new WASM.World(
      rows, 
      cols, 
      age, 
      ants, 
      CHUNK_SIZE, 
      wasmTilset, 
      RAIN_FREQ, 
      RAIN_TIME, 
      PEST_FREQ, 
      PEST_START,
      CONVERT_PROB,
      KILL_PROB,
      EVAPORATE_PROB,
    );
    this._legal = this.wasmWorld.legal.bind(this.wasmWorld);
    this.setRows = this.wasmWorld.set_rows.bind(this.wasmWorld);
    this.getRows = this.wasmWorld.get_rows.bind(this.wasmWorld);
    this.setCols = this.wasmWorld.set_cols.bind(this.wasmWorld);
    this.getCols = this.wasmWorld.get_rows.bind(this.wasmWorld);
    this.getAge = this.wasmWorld.get_age.bind(this.wasmWorld);
    this.setAge = this.wasmWorld.set_age.bind(this.wasmWorld);
    this.setAnts = this.wasmWorld.set_ants.bind(this.wasmWorld);
    this.getAnts = this.wasmWorld.get_ants.bind(this.wasmWorld);
    this.setTiles = this.wasmWorld.set_tiles.bind(this.wasmWorld);
    this.getTiles = this.wasmWorld.get_tiles.bind(this.wasmWorld);
    this.getTile = this.wasmWorld.get_tile.bind(this.wasmWorld);
    this.checkTile = this.wasmWorld.check_tile.bind(this.wasmWorld);
    this.setTile = this.wasmWorld.set_tile.bind(this.wasmWorld);
    this.doRain = this.wasmWorld.do_rain.bind(this.wasmWorld);
    this._getChunks = this.wasmWorld.get_chunks.bind(this.wasmWorld);
    this._updateChunks = this.wasmWorld.update_chunks.bind(this.wasmWorld);
    this.tick = this.wasmWorld.tick.bind(this.wasmWorld);
    this.rows = rows;
    this.cols = cols;
    this.age = 0;
    this.ants = 1;
    this.generatorSettings = generatorSettings;
    this.worldgen = new Worldgen(this);
    this.worldlogic = new Worldlogic(this);
    this.worldgen.generate(generatorSettings);
  }

  checkChunks(x, y, mask, distance = 0, threshold = 1) {
    if (!this._legal(x, y)) return false;
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
   * Swaps the tiles at the given coordinates if they match the mask
   * @param {number} x - x coordinate of first tile
   * @param {number} y - y coordinate of first tile
   * @param {number} a - x coordinate of second tile
   * @param {number} b - y coordinate of second tile
   * @param {string[]} mask - allowed type of second tile
   * @returns {boolean} - whether the tiles were swapped
   */
  swapTiles(x, y, a, b, mask = false) {
    if (!this.checkTile(a, b, JSON.stringify(mask))) {
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
        if (mask.length && !me.checkTile(x, y, JSON.stringify(mask))) return;
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
      if (mask.length && !me.checkTile(x, y, JSON.stringify(mask))) return;
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

if (typeof module === 'object') {
  module.exports = { World };
}