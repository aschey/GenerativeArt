let minBgVals = null;
let maxBgVals = null;
let pixels = null;
let width = 0;
let height = 0;
let bufferWidth = 0;

document.addEventListener("DOMContentLoaded", async function () {
  const manager = new AppManager(2200, 800);
  width = manager.width;
  height = manager.height;
  manager.app.renderer.backgroundColor = getColorInt(COLORSCHEME.background1);

  let bg1Vals = hexStringToInts(COLORSCHEME.background1);
  let bg2Vals = hexStringToInts(COLORSCHEME.background2);
  minBgVals = bg1Vals.map((v, i) => Math.min(v, bg2Vals[i]));
  maxBgVals = bg1Vals.map((v, i) => Math.max(v, bg2Vals[i]));

  cRange2d(BG_DELTA_Y, height, BG_DELTA_Y, BG_DELTA_X, width, BG_DELTA_X).map(
    (pair) => {
      let dotColor = colorGradientGaussian(
        COLORSCHEME.background1,
        COLORSCHEME.background2,
        BG_MEAN,
        BG_STD_DEV
      );
      manager.exec((g) => {
        g.beginFill(getColorInt(dotColor));
        g.drawRect(
          pair.x + equiRandom(BG_VAR),
          pair.y + equiRandom(BG_VAR),
          1,
          1
        );
      });
    }
  );

  manager.append();
  await draw(manager, width, height);
});

async function draw(manager, width, height) {
  for (let res of doCollatz()) {
    if (random() < res.prevY / height) {
      manager.graphics.lineStyle(
        THICKNESS,
        getColorInt(random(COLORSCHEME.colors))
      );

      manager.exec((g) => {
        g.moveTo(res.prevX, res.prevY);
        g.lineTo(res.nextX, res.nextY);
      });
    } else {
      manager.graphics.lineStyle(
        THICKNESS,
        getColorInt(
          colorGradient(
            COLORSCHEME.foreground1,
            COLORSCHEME.foreground2,
            perlin(
              res.val * LINE_NOISE_RATIO,
              res.val * LINE_NOISE_RATIO,
              NOISE_OCTAVES,
              NOISE_FALLOFF
            )
          )
        )
      );
      let gx = lineGauss();
      let gy = lineGauss();
      manager.exec((g) => {
        g.moveTo(res.prevX + gx, res.prevY + gy);
        g.lineTo(res.nextX + gx, res.nextY + gy);
      });
    }
  }
  for (let res of doCollatz()) {
    if (random() < COLOR_LINE_PROB) {
      manager.graphics.lineStyle(
        THICKNESS,
        getColorInt(random(COLORSCHEME.colors))
      );
      manager.exec((g) => {
        g.moveTo(2 * height - res.prevX, height - res.prevY);
        g.lineTo(2 * height - res.nextX, height - res.nextY);
      });
    }
  }
  setTimeout(() => {
    startPerfTimer();
    requestAnimationFrame(async () => {
      let gl = document
        .getElementsByTagName("canvas")[0]
        .getContext("webgl2", { preserveDrawingBuffer: true });
      gl.finish();
      pixels = new Uint8Array(
        gl.drawingBufferWidth * gl.drawingBufferHeight * 4
      );
      gl.readPixels(
        0,
        0,
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
      );
      bufferWidth = gl.drawingBufferWidth;

      let squareResult = await worker(
        _.range(SQUARES_START_Y, height, SQUARES_DELTA_Y),
        "collatz.worker.js",
        (getSquares, startY, endY) =>
          getSquares(
            startY,
            endY,
            width,
            height,
            bufferWidth,
            minBgVals,
            maxBgVals,
            pixels,
            SQUARES_DELTA_X,
            SQUARES_DELTA_Y,
            MAX_SQUARE_SIDE
          )
      );
      let squares = _.flatten(squareResult);
      for (let square of squares) {
        drawFill(square, manager);
      }
      manager.append();
      endPerfTimer();
    });
  }, 1);
}

function* doCollatz() {
  for (let i = START_N; i < END_N; i++) {
    let prevX = i;
    let prevY = i;
    let prev = i;

    for (let next of genCollatz(i)) {
      let nextX = prevX;
      let nextY = prevY;
      if (prev % 2 == 0) {
        nextY = next;
      } else {
        nextX = next;
      }

      yield { prevX, prevY, nextX, nextY, val: i };

      prevX = nextX;
      prevY = nextY;
      prev = next;
    }
  }
}

function drawFill(res, manager) {
  manager.graphics.beginFill(
    getColorInt(random(COLORSCHEME.colors)),
    getColorInt(ALPHA) / getColorInt("FF")
  );
  for (let i = 0; i < res.length; i++) {
    let cur = res[i];
    let next = res[i === res.length - 1 ? 0 : i + 1];
    let slope = Math.abs(getSlope(cur.x, cur.y, next.x, next.y));
    // Don't draw shapes with large diagonal lines
    if (
      slope !== Infinity &&
      distance(cur.x, cur.y, next.x, next.y) > IGNORE_DIAG_LENGTH &&
      slope > IGNORE_DIAG_LOWER_SLOPE &&
      slope < IGNORE_DIAG_UPPER_SLOPE
    ) {
      return;
    }
  }

  let shapeArray = [];
  for (let p of res) {
    shapeArray.push(p.x);
    shapeArray.push(height - p.y);
  }
  manager.exec((g) => g.drawPolygon(shapeArray));
  manager.graphics.endFill();
}

function lineGauss() {
  return Math.round(randomGaussian(LINE_MEAN, LINE_STD_DEV));
}

function* genCollatz(n) {
  let current = n;
  while (current > 1) {
    if (current % 2 == 0) {
      current /= 2;
    } else {
      current = current * 3 + 1;
    }
    yield current;
  }
}
