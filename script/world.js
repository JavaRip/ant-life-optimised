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
    forEachTile(this.rows, this.cols, minX, minY, maxX, maxY, function (x, y) {
      if (mask.length && !me.checkTile(x, y, mask, this.rows, this.cols, this.tiles)) {
        return;
      }
      me.tiles = setTile(me.rows, me.cols, me.tiles, x, y, tile).tiles;
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
