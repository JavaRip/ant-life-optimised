const ROW_COUNT = 100;
const COL_COUNT = 100;
const TILESET = {
  AIR: "skyblue",
  SOIL: "peru",
  SAND: "sandybrown",
  STONE: "slategray",
  ANT: "red",
  QUEEN: "blueviolet",
  EGG: "white",
  CORPSE: "black",
  PLANT: "olivedrab",
  WATER: "blue",
  FUNGUS: "teal",
  PEST: "fuchsia",
};
const START_PAUSED = false;
let DEBUG = false;

const FPS = 30;
let FRAME_TIMER;
let WORLD;
let RENDERER;
let BRUSH_ON = false;
let BRUSH_X;
let BRUSH_Y;
let LAST_ANT_COUNT = 1;

$(document).ready(function () {
  init();
  setupControls();
  if (!START_PAUSED) {
    $("#btn-pause").trigger("click");
  }
});

function setupControls() {
  $("#btn-pause").on("click", function () {
    if (FRAME_TIMER) {
      clearTimeout(FRAME_TIMER);
      FRAME_TIMER = null;
      $(this).text("Play");
    } else {
      $(this).text("Pause");
      gameLoop();
    }
  });

  $("#btn-tick").on("click", function () {
    gameLoop(false);
  });

  $("#btn-reset").on("click", function () {
    init();
    if (START_PAUSED && FRAME_TIMER) {
      clearTimeout(FRAME_TIMER);
      FRAME_TIMER = null;
      $("#btn-pause").text("Play");
    }
  });

  $("#map").on("pointerdown", function (e) {
    _setPointerLocation(e);
    BRUSH_ON = true;
    doInput();
  });
  $("#map").on("pointermove", function (e) {
    _setPointerLocation(e);
    if (BRUSH_ON) doInput();
  });
  $("#map").on("pointerup pointercancel pointerout", function (e) {
    BRUSH_ON = false;
  });
}

function _setPointerLocation(e) {
  const { x, y } = RENDERER.mapCoordinates(e.clientX, e.clientY);
  BRUSH_X = x;
  BRUSH_Y = y;
}

function init() {
  if (DEBUG) console.log("Loading...");
  $("#score").text("");
  WORLD = new World(ROW_COUNT, COL_COUNT);
  RENDERER = new Renderer(document.getElementById("map"), WORLD, TILESET);
  RENDERER.draw();
  prompt(`
    Spring has arrived and plants are sprouting <br/>
    Guide your queen (purple) to fungus (teal) to begin your new colony
  `);
  if (DEBUG) console.log(WORLD);
}

function gameLoop(loop = true) {
  const start = Date.now();

  doInput(false);
  WORLD.tick();
  RENDERER.draw();

  if (LAST_ANT_COUNT === 1 && WORLD.ants > 1) {
    prompt(`
      The first workers (red) have begun to hatch from eggs (white) <br/> 
      Grow more fungus (teal) by bringing it plant material (green)
    `);
  }
  if (WORLD.ants > 1) {
    $("#score").text(WORLD.ants);
  }
  LAST_ANT_COUNT = WORLD.ants;

  if (WORLD.age === 2000) {
    prompt(`
      The spring rains will start soon, prepare for the flood! <br/>
      Water (blue) kills workers (red), queens (purple), and eggs (white)
    `);
  } else if (WORLD.age === 3000) {
    prompt(`
    The rains have stopped for now, but will return regularly <br/>
    Water (blue) evaporates in the sun and is absorbed by plants (green)
  `);
  } else if (WORLD.age === 3500) {
    prompt(`
    Pests (pink) will soon be attracted by the new growth <br/>
    Pests will hunt for eggs (white) but workers (red) will fight back
  `);
  } else if (WORLD.age === 4300) {
    prompt(`
    Stay on guard for more pests and rainfall <br/>
    Protect the queen and grow the colony by farming fungus
  `);
  }

  if (DEBUG) {
    const elapsed = Date.now() - start;
    console.log(`Tick ${WORLD.age} completed in ${elapsed}ms`);
  }

  const delayMS = Math.max(Math.round(start + 1000 / FPS) - Date.now(), 0);
  if (loop) {
    FRAME_TIMER = setTimeout(gameLoop, delayMS);
  }
}

function doInput(draw = true) {
  if (!BRUSH_ON) return;
  const brushSize = Math.round($("#brush-size").val());
  const brushMat = $("#brush-mat").val();
  WORLD.fillCircle(BRUSH_X, BRUSH_Y, brushSize, brushMat, [
    "AIR",
    "SOIL",
    "SAND",
  ]);
  if (draw) RENDERER.draw();
}

function prompt(text) {
  $("#info").html(text);
  $("#info").addClass("alert");
  setTimeout(function () {
    $("#info").removeClass("alert");
  }, 1000);
}
