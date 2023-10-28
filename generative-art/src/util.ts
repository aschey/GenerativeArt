import _ from "lodash";
import "lodash.product";
import * as Comlink from "comlink";
import Perlin from "@/perlin";
import * as PIXI from "pixi.js";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const random = (min?: number, max?: number) => {
  if (min == null && max == null) {
    return Math.random();
  }
  if (min != null && max == null) {
    return Math.random() * min;
  }
  if (min != null && max != null) {
    return Math.random() * (max - min) + min;
  }
  return 0;
};

export const randomSample = <T>(val: T[]) => {
  return val[Math.floor(Math.random() * val.length)];
};

export const intersects = (
  x1a: number,
  y1a: number,
  x2a: number,
  y2a: number,
  x1b: number,
  y1b: number,
  x2b: number,
  y2b: number
) => {
  var det, gamma, lambda;
  det = (x2a - x1a) * (y2b - y1b) - (x2b - x1b) * (y2a - y1a);
  if (det === 0) {
    return false;
  } else {
    lambda = ((y2b - y1b) * (x2b - x1a) + (x1b - x2b) * (y2b - y1a)) / det;
    gamma = ((y1a - y2a) * (x2b - x1a) + (x2a - x1a) * (y2b - y1a)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
};

export const getSlope = (x1: number, y1: number, x2: number, y2: number) => {
  return (y2 - y1) / (x2 - x1);
};

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

interface Angles {
  [x: number]: { [y: number]: number };
}

// taken from https://github.com/lovasoa/graham-fast/blob/master/index.js
// See https://en.wikipedia.org/wiki/Graham_scan
export const grahamScan = (points: Coord[]) => {
  // The enveloppe is the points themselves
  if (points.length <= 3) return points;

  // Find the pivot
  var pivot = points[0];
  for (var i = 0; i < points.length; i++) {
    if (
      points[i].y < pivot.y ||
      (points[i].y === pivot.y && points[i].x < pivot.x)
    ) {
      pivot = points[i];
    }
  }

  const angles: Angles = {};

  // Attribute an angle to the points
  for (var i = 0; i < points.length; i++) {
    if (angles[points[i].x] == null) {
      angles[points[i].x] = {};
    }
    angles[points[i].x][points[i].y] = Math.atan2(
      points[i].y - pivot.y,
      points[i].x - pivot.x
    );
  }
  points.sort((a, b) => {
    return angles[a.x][a.y] === angles[b.x][b.y]
      ? a.x - b.x
      : angles[a.x][a.y] - angles[b.x][b.y];
  });

  // Adding points to the result if they "turn left"
  var result = [points[0]],
    len = 1;
  for (var i = 1; i < points.length; i++) {
    var a = result[len - 2],
      b = result[len - 1],
      c = points[i];
    while (
      (len === 1 && b.x === c.y && b.y === c.y) ||
      (len > 1 && (b.x - a.x) * (c.y - a.y) <= (b.y - a.y) * (c.x - a.x))
    ) {
      len--;
      b = a;
      a = result[len - 2];
    }
    result[len++] = c;
  }
  result.length = len;
  return result;
};

export const getPixel = (
  pixels: Uint8Array,
  x: number,
  y: number,
  width: number
) => {
  let index = Math.round(4 * (y * width + x));
  return [pixels[index], pixels[index + 1], pixels[index + 2]];
};

export const equiRandom = (val: number) => {
  return random(-val, val);
};

// See https://en.wikipedia.org/wiki/Flood_fill
// https://gist.github.com/arcollector/155a8c751f65c15872fb
export const floodFill = (
  seedX: number,
  seedY: number,
  isBackground: (x: number, y: number) => boolean,
  width: number
) => {
  let points: Coord[] = [];
  let isCurrentBackground = (x: number, y: number) =>
    isBackground(x, y) && !points.some((p) => p.x === x && p.y === y);
  let seedScanline = (xLeft: number, xRight: number, y: number) => {
    let x = xLeft;

    while (x <= xRight) {
      // seed the scan line above
      let beginX = x;
      for (; isCurrentBackground(x, y) && x < xRight; x++);

      if (x === xRight && isCurrentBackground(x, y)) {
        stack.push({ x: x, y: y });
      } else if (x > beginX) {
        stack.push({ x: x - 1, y: y });
      }

      // continue checking in case the span is interrupted
      //let xEnter = x;
      for (x++; !isCurrentBackground(x, y) && x < xRight; x++);
      // make sure that the px coordinate is incremented
      //if(x === xEnter) {
      //	x++;
      //}
    }
  };

  var stack = [];
  stack.push({ x: seedX, y: seedY });

  while (stack.length > 0) {
    // get the seed px and set it to the new value
    let popElem = stack[stack.length - 1];
    stack = stack.slice(0, stack.length - 1);
    let x = popElem.x;
    let y = popElem.y;

    points.push({ x, y });

    // save the x coordinate of the seed px
    let saveX = x;
    // fill the span to the left of the seed px
    for (x--; isCurrentBackground(x, y) && x > 0; x--) {
      points.push({ x, y });
      if (points.length > 10000) {
        return [];
      }
    }
    // save the extreme left px
    let xLeft = x + 1;

    // fill the span to the right of the seed px
    x = saveX;
    for (x++; isCurrentBackground(x, y) && x < width; x++) {
      points.push({ x, y });
      if (points.length > 10000) {
        return [];
      }
    }
    // save the extreme right px
    let xRight = x - 1;

    // check that scan line above is neither a polygon boundary nor has
    // been previously completely filled; if not, seed the scan line
    // start at the left edge of the scan line subspan
    seedScanline(xLeft, xRight, y + 1);

    // check that the scan line below is ot a polygon boundary
    // nor has been previously completely filled
    seedScanline(xLeft, xRight, y - 1);
  }

  return points;
};

export const limitedGaussian = (
  mean: number,
  stdDev: number,
  lowerBound: number,
  upperBound: number
) => {
  let val = randomGaussian(mean, stdDev);
  val = Math.min(upperBound, val);
  val = Math.max(lowerBound, val);
  return val;
};

export const maxYVal = (x1: number, x2: number, y1: number, distance: number) =>
  Math.sqrt(Math.abs(Math.pow(distance, 2) - Math.pow(x2 - x1, 2))) + y1;

export const maxXVal = (x1: number, y1: number, y2: number, distance: number) =>
  Math.sqrt(Math.abs(Math.pow(distance, 2) - Math.pow(y2 - y1, 2))) + x1;

export const polarToCartesian = (r: number, theta: number) => ({
  x: r * Math.cos(theta),
  y: r * Math.sin(theta),
});

export const range2d = (
  start1: number,
  end1: number,
  step1: number,
  start2: number,
  end2: number,
  step2: number,
  label1: string,
  label2: string
) =>
  _.product(_.range(start1, end1, step1), _.range(start2, end2, step2)).map(
    (pair) => ({ [label1]: pair[0], [label2]: pair[1] })
  );

export const cRange2d = (
  start1: number,
  end1: number,
  step1: number,
  start2: number,
  end2: number,
  step2: number
): Coord[] =>
  range2d(start1, end1, step1, start2, end2, step2, "y", "x") as any;

export const worker = <I, O>(
  seq: number[],
  mkWorker: () => Worker,
  workerFunc: (
    input: Comlink.Remote<I>,
    start: number,
    end: number
  ) => Promise<O>,
  numWorkers: number = navigator.hardwareConcurrency - 1
) => {
  const numIters = seq.length - 1;
  let maxThreads = Math.min(numWorkers, numIters);
  let batchSize = Math.max(Math.ceil(numIters / maxThreads), 1);

  let numThreads = numIters / batchSize;

  let threads = _.range(0, numThreads).map((iter) => {
    return workerFunc(
      Comlink.wrap<I>(mkWorker()),
      seq[iter * batchSize],
      seq[Math.min((iter + 1) * batchSize, numIters)]
    );
  });

  return threads;
};

let t0: number = 0;
export const startPerfTimer = () => {
  t0 = performance.now();
};

export const endPerfTimer = () => {
  let t1 = performance.now();
  console.log("Call took " + (t1 - t0) + " milliseconds.");
  t0 = 0;
};

export const perlin = (
  x: number,
  y: number,
  octaves: number,
  persistence: number
) => {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  const noise = new Perlin();
  for (var i = 0; i < octaves; i++) {
    total += noise.perlin2(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }
  return (total / maxValue + 1) * 0.5;
};

export const perlin2 = (
  x: number,
  y: number,
  octaves: number,
  persistence: number
) => {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  const noise = new Perlin();
  for (var i = 0; i < octaves; i++) {
    total += Math.abs(noise.perlin2(x * frequency, y * frequency)) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return Math.min((total / maxValue) * 2, 1.0);
};

// function getImage() {
//   let url:string;
//   requestAnimationFrame(
//     () => (url = window.app.renderer.view.toDataURL("image/png", 1))
//   );
//   setTimeout(() => {
//     let img = document.createElement("img");
//     img.src = url;
//     document.body.appendChild(img);
//   }, 500);
// }
// var newY = renderer.height - p.y - 1;
// requestAnimationFrame(() => p = app.renderer.plugins.extract.pixels())

// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
export const randomGaussian = (mean: number, sigma: number) => {
  let u = Math.random() * 0.682;
  return (
    (u % 1e-8 > 5e-9 ? 1 : -1) *
      (Math.sqrt(-Math.log(Math.max(1e-9, u))) - 0.618) *
      1.618 *
      sigma +
    mean
  );
};

// Function to calculate cubic bezier control points from
// an array of points along the desired curve
// from https://github.com/YR/catmull-rom-spline/blob/master/src/index.js
export const calcControlPoints = (points: number[][]) => {
  const n = points.length;

  // Abort if there are not sufficient points to draw a curve
  if (n < 3) return points;

  let p0 = points[0];
  let p1 = points[0];
  let p2 = points[1];
  let p3 = points[2];
  let pts = [points[0]];

  for (let i = 1; i < n; i++) {
    pts.push([
      (-p0[0] + 6 * p1[0] + p2[0]) / 6,
      (-p0[1] + 6 * p1[1] + p2[1]) / 6,
      (p1[0] + 6 * p2[0] - p3[0]) / 6,
      (p1[1] + 6 * p2[1] - p3[1]) / 6,
      p2[0],
      p2[1],
    ]);

    p0 = p1;
    p1 = p2;
    p2 = p3;
    p3 = points[i + 2] || p3;
  }

  return pts;
};

export const drawCurve = (graphics: PIXI.Graphics, points: number[][]) => {
  if (points.length < 3) return;

  const controls = calcControlPoints(points);

  graphics.moveTo(controls[0][0], controls[0][1]);
  controls
    .slice(1)
    .forEach((p) => graphics.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]));
};

export const angleBetweenPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  return Math.atan2(y2 - y1, x2 - x1);
};

export interface Coord {
  x: number;
  y: number;
}
