import {
  cRange2d,
  distance,
  equiRandom,
  getSlope,
  intersects,
  limitedGaussian,
  perlin2,
  random,
  randomGaussian,
} from "@/util";
import {
  BG_DELTA_MAX,
  BG_DELTA_MIN,
  BUSH_MAX_BRANCHES,
  BUSH_MAX_HEIGHT,
  BUSH_MIN_BRANCHES,
  BUSH_MIN_HEIGHT,
  BUSH_THRESH,
  BUSH_VAR_X,
  BUSH_VAR_Y,
  COLORSCHEME,
  DIST_THRESH,
  MAX_ITERS,
  MAX_TRUNK_HEIGHT,
  MAX_X,
  MAX_X_THRESH_END,
  MAX_Y_THRESH_FACTOR_BOTTOM,
  MAX_Y_THRESH_FACTOR_TOP,
  MIN_TRUNK_HEIGHT,
  MIN_X_THRESH_END,
  MIN_Y_FACTOR,
  MIN_Y_THRESH_FACTOR_BOTTOM,
  MIN_Y_THRESH_FACTOR_TOP,
  NOISE_FALLOFF,
  NOISE_OCTAVES,
  PLACE_VAR_MAX,
  PLACE_VAR_MIN,
  START_X,
  START_Y,
  TYPES,
  X_NOISE_RATIO,
  Y_NOISE_RATIO,
} from "./consts";
import * as Comlink from "comlink";
import { colorGradient } from "@/colorUtil";

export interface DrawResult {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  branchCount: number;
  level: number;
}

const drawTrees = (
  startX: number,
  width: number,
  startY: number,
  endY: number
) => {
  let res = cRange2d(startY, endY, START_Y, startX, width, START_X).map(
    (pair) =>
      drawTree(
        pair.x + random(PLACE_VAR_MIN, PLACE_VAR_MAX),
        pair.y + random(PLACE_VAR_MIN, PLACE_VAR_MAX)
      )
  );

  return res;
};

const drawTree = (x: number, y: number): DrawResult[] => {
  let iters = 0;
  let typeProb = random();

  let type =
    TYPES[
      Object.keys(TYPES).filter(
        (t) => TYPES[t].probMin <= typeProb && TYPES[t].probMax > typeProb
      )[0]
    ];
  let isBush =
    perlin2(
      x * X_NOISE_RATIO,
      y * Y_NOISE_RATIO,
      NOISE_OCTAVES,
      NOISE_FALLOFF
    ) < BUSH_THRESH;
  let trunkHeight = random(
    isBush ? BUSH_MIN_HEIGHT : MIN_TRUNK_HEIGHT,
    isBush ? BUSH_MAX_HEIGHT : MAX_TRUNK_HEIGHT
  );
  // draw trunk
  let trunk = {
    x1: x,
    y1: y,
    x2: x,
    y2: y - trunkHeight,
    branchCount: 0,
    level: 0,
  };
  let lines = [trunk];
  let numBranches = isBush
    ? random(BUSH_MIN_BRANCHES, BUSH_MAX_BRANCHES)
    : random(type.minBranches, type.maxBranches);
  let yThreshFactorBottom = random(
    MIN_Y_THRESH_FACTOR_BOTTOM,
    MAX_Y_THRESH_FACTOR_BOTTOM
  );
  let yThreshFactorTop = random(
    MIN_Y_THRESH_FACTOR_TOP,
    MAX_Y_THRESH_FACTOR_TOP
  );
  let xThreshEnd = random(MIN_X_THRESH_END, MAX_X_THRESH_END);
  let slopeThresh = random(type.minSlopeThresh, type.maxSlopeThresh);

  while (lines.length < numBranches && iters < MAX_ITERS) {
    iters++;
    let availLines = lines
      .filter((l) => l.branchCount < type.maxBranchOffCount && l.level < 3)
      .sort((l) => l.y1);
    let curLine =
      isBush || random() < type.trunkPropensity
        ? trunk
        : availLines[Math.round(type.lineSelector(availLines.length))];
    // if (curLine === undefined) {
    //   debugger;
    // }
    // get a point on the line y = mx + b
    let slope = getSlope(curLine.x1, curLine.y1, curLine.x2, curLine.y2);
    let intercept = curLine.y1 - slope * curLine.x1;
    let x1a = curLine.x1 + xThreshEnd * (curLine.x2 - curLine.x1);
    let x1b = curLine.x2 - xThreshEnd * (curLine.x2 - curLine.x1);
    let x1Max = Math.min(Math.max(x1a, x1b), trunk.x1 + MAX_X);
    let x1Min = Math.max(Math.min(x1a, x1b), trunk.x1 - MAX_X);
    let x1Diff = x1Max - x1Min;
    let x1 = limitedGaussian(
      x1Min + x1Diff * type.xDiffRatio,
      x1Diff,
      x1Min,
      x1Max
    );
    let y1a = curLine.y1 - yThreshFactorBottom * (curLine.y1 - curLine.y2);
    let y1b = curLine.y2 + yThreshFactorTop * (curLine.y1 - curLine.y2);
    let y1Max = Math.max(y1a, y1b);
    let y1Min = Math.min(y1a, y1b);
    let y1Diff = y1Max - y1Min;
    let y1 =
      Math.abs(slope) === Infinity
        ? limitedGaussian(
            y1Min + y1Diff * type.yDiffRatio,
            y1Diff,
            y1Min,
            y1Max
          )
        : slope * x1 + intercept;
    let x2 = isBush
      ? x1 + equiRandom(BUSH_VAR_X)
      : x1 + randomGaussian(type.xMean, type.xStdDev);
    let y2 = isBush
      ? y1 + random(-BUSH_VAR_Y * (lines.length / numBranches), 0)
      : y1 + randomGaussian(type.yMean, type.yStdDev);
    y2 = Math.max(y2, trunk.y1 - trunkHeight * MIN_Y_FACTOR);
    let maxDistance = Math.min(
      ...[
        8 * (3 - curLine.level),
        trunkHeight - distance(trunk.x1, trunk.y1, trunk.x2, y1),
        distance(curLine.x1, curLine.y1, curLine.x2, curLine.y2),
      ]
    );
    if (!isBush && distance(x1, y1, x2, y2) > maxDistance) {
      let r = (maxDistance / distance(x1, y1, x2, y2)) * random();
      let newX = x1 + (x2 - x1) * r;
      let oldSlope = getSlope(x1, y1, x2, y2);
      let oldIntercept = y1 - oldSlope * x1;
      y2 = oldSlope * newX + oldIntercept;
      x2 = newX;
    }

    let tooSimilar = false;
    if (!isBush) {
      let curSlope = getSlope(x1, y1, x2, y2);
      for (let prevLine of lines) {
        let prevSlope = getSlope(
          prevLine.x1,
          prevLine.y1,
          prevLine.x2,
          prevLine.y2
        );
        // Don't allow any lines to intersect, any two slopes to be too similar, or any two end points to be too close
        if (
          Math.abs(curSlope) === Infinity ||
          intersects(
            x1,
            y1,
            x2,
            y2,
            prevLine.x1,
            prevLine.y1,
            prevLine.x2,
            prevLine.y2
          ) ||
          (prevSlope - slopeThresh <= curSlope &&
            curSlope <= prevSlope + slopeThresh) ||
          distance(x2, y2, prevLine.x2, prevLine.y2) < DIST_THRESH
        ) {
          tooSimilar = true;
          break;
        }
      }
      if (tooSimilar) {
        continue;
      }
    }

    lines.push({ x1, y1, x2, y2, branchCount: 0, level: curLine.level + 1 });
    curLine.branchCount++;
  }

  return lines;
};

const getSnowColors = (startY: number, endY: number, width: number) => {
  let res = cRange2d(startY, endY, 1, 0, width, 1).map((pair) => {
    pair.x += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);
    pair.y += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);

    let noiseVal = perlin2(
      pair.x * X_NOISE_RATIO,
      pair.y * Y_NOISE_RATIO,
      1,
      NOISE_FALLOFF
    );

    let val = colorGradient(
      COLORSCHEME.background1,
      COLORSCHEME.background2,
      noiseVal
    );

    return [noiseVal, val!, pair];
  });

  return res;
};

Comlink.expose({ drawTrees, getSnowColors });
