"use client";
// @refresh reset

import {
  colorGradient,
  colorGradientGaussian,
  getColorInt,
  hexStringToInts,
} from "@/colorUtil";
import { COLORS } from "@/colors";
import { useRenderer } from "@/useRenderer";
import {
  Coord,
  cRange2d,
  distance,
  endPerfTimer,
  equiRandom,
  getSlope,
  perlin,
  random,
  randomGaussian,
  randomSample,
  startPerfTimer,
  worker,
} from "@/util";
import { Container, Graphics, Sprite, Stage, useApp, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { useCallback, useMemo, useRef } from "react";

const COLORSCHEME = COLORS.autumn;
const ALPHA = "AA";

// mean for gauss randomization of lines
const LINE_MEAN = 0;
// std dev for gauss randomization of lines
const LINE_STD_DEV = 4;
// start collatz number
const START_N = 0;
// end collatz number
const END_N = 500;
// line color alpha

// probability of choosing a colored line
const COLOR_LINE_PROB = 0.2;
// coefficient to pass to noise() for x and y coords
const LINE_NOISE_RATIO = 0.2;
// change in x values when creating background texture
const BG_DELTA_X = 10;
// change in y values when creating background texture
const BG_DELTA_Y = 10;
// variance when choosing background coords
const BG_VAR = 5;
// background starting color
const BG_BASE_COLOR = 100;
// gaussian mean for background color adjustment percentage (0 - 1.0)
const BG_MEAN = 0.7;
// gaussian std dev for background color adjustment percentage (0 - 1.0)
const BG_STD_DEV = 0.2;
// start y value for adding fill squares
const SQUARES_START_Y = 25;
// change in y value for adding fill squares
let SQUARES_DELTA_Y = 0;
// change in x value for adding fill squares
let SQUARES_DELTA_X = 0;
try {
  SQUARES_DELTA_Y = Math.round(25 * (1 / window.devicePixelRatio));
  SQUARES_DELTA_X = Math.round(25 * (1 / window.devicePixelRatio));
} catch (e) {
  // Happens in worker because window is not defined
}
// variance when choosing coords for fill squares
const SQUARES_VAR = 12;
let MAX_SQUARE_SIDE = 0;
try {
  MAX_SQUARE_SIDE = 100 * (1 / window.devicePixelRatio);
} catch (e) {
  // Happens in worker because window is not defined
}
const IGNORE_DIAG_LENGTH = 10;
const IGNORE_DIAG_LOWER_SLOPE = 0.05;
const IGNORE_DIAG_UPPER_SLOPE = 10;

const THICKNESS = 1;

// Number of octaves to use for Perlin noise
const NOISE_OCTAVES = 4;
// Factor to use for Perlin noise falloff
const NOISE_FALLOFF = 0.2;

const WIDTH = 2200;
const HEIGHT = 800;

const Collatz: React.FC<{}> = () => {
  return (
    <Stage
      width={WIDTH}
      height={HEIGHT}
      options={{
        backgroundColor: getColorInt(COLORSCHEME.background1),
        antialias: true,
        preserveDrawingBuffer: true,
      }}
    >
      <CollatzInner />
    </Stage>
  );
};

function* genCollatz(n: number) {
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

function lineGauss() {
  return Math.round(randomGaussian(LINE_MEAN, LINE_STD_DEV));
}

const CollatzInner: React.FC<{}> = () => {
  const { exec, append, textureRef, graphicsRef } = useRenderer();

  const drawFill = useCallback(
    (res: Coord[], g: PIXI.Graphics) => {
      g.beginFill(
        getColorInt(randomSample(COLORSCHEME.colors)),
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

      let shapeArray: number[] = [];
      for (let p of res) {
        shapeArray.push(p.x);
        shapeArray.push(HEIGHT - p.y);
      }
      exec(() => g.drawPolygon(shapeArray));
      g.endFill();
    },
    [exec]
  );

  const drawMain = useCallback(
    async (g: PIXI.Graphics) => {
      for (let res of doCollatz()) {
        if (random() < res.prevY / HEIGHT) {
          g.lineStyle(THICKNESS, getColorInt(randomSample(COLORSCHEME.colors)));

          exec(() => {
            g.moveTo(res.prevX, res.prevY);
            g.lineTo(res.nextX, res.nextY);
          });
        } else {
          g.lineStyle(
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
              )!
            )
          );
          let gx = lineGauss();
          let gy = lineGauss();
          exec(() => {
            g.moveTo(res.prevX + gx, res.prevY + gy);
            g.lineTo(res.nextX + gx, res.nextY + gy);
          });
        }
      }
      for (let res of doCollatz()) {
        if (random() < COLOR_LINE_PROB) {
          g.lineStyle(THICKNESS, getColorInt(randomSample(COLORSCHEME.colors)));
          exec(() => {
            g.moveTo(2 * HEIGHT - res.prevX, HEIGHT - res.prevY);
            g.lineTo(2 * HEIGHT - res.nextX, HEIGHT - res.nextY);
          });
        }
      }
      setTimeout(() => {
        startPerfTimer();
        requestAnimationFrame(async () => {
          let gl = document
            .getElementsByTagName("canvas")[0]
            .getContext("webgl2", { preserveDrawingBuffer: true })!;
          gl.finish();
          let pixels = new Uint8Array(
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
          let bufferWidth = gl.drawingBufferWidth;

          let bg1Vals = hexStringToInts(COLORSCHEME.background1);
          let bg2Vals = hexStringToInts(COLORSCHEME.background2);
          let minBgVals = bg1Vals.map((v, i) => Math.min(v, bg2Vals[i]));
          let maxBgVals = bg1Vals.map((v, i) => Math.max(v, bg2Vals[i]));

          let squareResult = await Promise.all(
            worker<any, Coord[][]>(
              _.range(SQUARES_START_Y, HEIGHT, SQUARES_DELTA_Y),
              () => new Worker(new URL("./collatz.worker.ts", import.meta.url)),
              (getSquares: any, startY: number, endY: number) =>
                getSquares(
                  startY,
                  endY,
                  WIDTH,
                  HEIGHT,
                  bufferWidth,
                  minBgVals,
                  maxBgVals,
                  pixels,
                  SQUARES_DELTA_X,
                  SQUARES_DELTA_Y,
                  MAX_SQUARE_SIDE
                )
            )
          );
          let squares = _.flatten(squareResult);
          for (let square of squares) {
            drawFill(square, g);
          }
          append();
          endPerfTimer();
        });
      }, 1);
    },
    [append, drawFill, exec]
  );

  const draw = useCallback(
    async (g: PIXI.Graphics) => {
      cRange2d(
        BG_DELTA_Y,
        HEIGHT,
        BG_DELTA_Y,
        BG_DELTA_X,
        WIDTH,
        BG_DELTA_X
      ).map((pair) => {
        let dotColor = colorGradientGaussian(
          COLORSCHEME.background1,
          COLORSCHEME.background2,
          BG_MEAN,
          BG_STD_DEV
        );

        exec(() => {
          g.beginFill(getColorInt(dotColor!));
          g.drawRect(
            pair.x + equiRandom(BG_VAR),
            pair.y + equiRandom(BG_VAR),
            1,
            1
          );
        });
      });
      append();

      await drawMain(g);
    },
    [exec, append, drawMain]
  );

  return (
    <Container>
      <Sprite texture={textureRef.current} />
      <Graphics ref={graphicsRef} draw={draw} />
    </Container>
  );
};

export default Collatz;
