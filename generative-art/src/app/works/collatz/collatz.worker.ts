import { Coord, equiRandom, floodFill, getPixel, grahamScan } from "@/util";
import * as Comlink from "comlink";

// variance when choosing coords for fill squares
const SQUARES_VAR = 12;

const getSquares = (
  startY: number,
  endY: number,
  width: number,
  height: number,
  bufferWidth: number,
  minBgVals: number[],
  maxBgVals: number[],
  pixels: Uint8Array,
  squaresDeltaX: number,
  squaresDeltaY: number,
  maxSquareSide: number
): Coord[][] => {
  function checkPixelColor(x: number, y: number) {
    let origX = x;
    let origY = y;
    if (!isBackground(x, y)) {
      return false;
    }
    for (; isBackground(x, y); x--);
    if (x === 0 || origX - x > 100) {
      return false;
    }
    x++;

    for (; isBackground(x, y); y--);
    if (y === 0 || origY - y > 100) {
      return false;
    }
    y++;

    let minX = x;
    let minY = y;

    for (; isBackground(x, y); x++);
    if (x === width || x - minX > maxSquareSide) {
      return false;
    }
    x--;

    for (; isBackground(x, y); y++);
    if (y === height || y - minY > maxSquareSide) {
      return false;
    }
    y--;

    let maxX = x;
    let maxY = y;
    x = minX;
    y = minY;
    for (; y < height && isBackground(x, y); y++);

    if (x === width || x - minX > maxSquareSide) {
      return false;
    }
    y--;

    for (; x < width && isBackground(x, y); x++);
    x--;

    if (Math.abs(x - maxX) > 0 || Math.abs(y - maxY) > 0) {
      return false;
    }

    return true;
  }

  const isBackground = (x: number, y: number) =>
    x < width &&
    y < height &&
    getPixel(pixels, x, y, bufferWidth).every(
      (d, i) => d >= minBgVals[i] && d <= maxBgVals[i]
    );

  const squares = [];
  for (let y = startY; y < endY; y += squaresDeltaY) {
    for (let x = y * 2 + SQUARES_VAR; x < width; x += squaresDeltaX) {
      let adjX = x + Math.round(equiRandom(SQUARES_VAR));
      let adjY = y + Math.round(equiRandom(SQUARES_VAR));
      if (checkPixelColor(adjX, adjY)) {
        let points = floodFill(adjX, adjY, isBackground, width);
        let res = grahamScan(points);
        if (res.length > 3) {
          squares.push(res);
        }
      }
    }
  }
  return squares;
};

Comlink.expose(getSquares);
