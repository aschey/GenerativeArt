"use client";
// @refresh reset

import { colorGradientGaussian, getColorInt } from "@/colorUtil";
import { Scribble } from "@/scribble";
import { useRenderer } from "@/useRenderer";
import { Container, Graphics, Sprite, Stage } from "@pixi/react";
import { button, useControls } from "leva";
import * as PIXI from "pixi.js";
import { useCallback, useRef } from "react";

const START_N = 1;
const END_N = 1000;
const SPACING = 0.3;
const DELTA = 5;
const BACKGROUND = "#bfbdb8";
const FOREGROUND1 = "#52473c";
const FOREGROUND2 = "#383634";
const BG_MEAN = 0.3;
const BG_STD_DEV = 0.2;
const WIDTH = 800;
const HEIGHT = 2000;

const Collatz2: React.FC<{}> = () => {
  return (
    <Stage
      width={WIDTH}
      height={HEIGHT}
      options={{
        backgroundColor: getColorInt(BACKGROUND),
        antialias: true,
        preserveDrawingBuffer: true,
      }}
    >
      <Collatz2Inner />
    </Stage>
  );
};

function* doCollatz(
  fr: (val: number) => number,
  ftheta: (val: number) => number,
  convert: boolean
) {
  let conversion = convert ? PIXI.DEG_TO_RAD : 1;
  for (let i = START_N; i < END_N; i++) {
    let prevR = i;
    let prevTheta = i;
    let prev = i;

    for (let next of genCollatz(i)) {
      let nextR = prevR;
      let nextTheta = prevTheta;
      if (prev % 2 == 0) {
        nextR = fr(next);
      } else {
        nextTheta = ftheta(next);
      }

      let res = {
        prevX: prevR * Math.cos(conversion * prevTheta),
        prevY: prevR * Math.sin(conversion * prevTheta),
        nextX: nextR * Math.cos(conversion * nextTheta),
        nextY: nextR * Math.sin(conversion * nextTheta),
        val: i,
        current: next,
      };
      if (res.prevX && res.prevY) {
        yield res;

        prevR = nextR;
        prevTheta = nextTheta;
        prev = next;
      }
    }
  }
}

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

let scribble = new Scribble();

export const Collatz2Inner: React.FC<{}> = () => {
  const { exec, append, textureRef, graphicsRef } = useRenderer();

  const drawShape = useCallback(
    (
      g: PIXI.Graphics,
      fr: (val: number) => number,
      ftheta: (val: number) => number,
      startX: number,
      startY: number,
      convert: boolean
    ) => {
      for (let res of doCollatz(fr, ftheta, convert)) {
        let xDelta = 0;
        let yDelta = 0;
        g.lineStyle(
          1,
          getColorInt(
            colorGradientGaussian(
              FOREGROUND1,
              FOREGROUND2,
              BG_MEAN,
              BG_STD_DEV
            )!
          )
        );
        if (res.prevX === res.nextX) {
          if (res.prevY < res.nextY) {
            xDelta = -SPACING / 4;
          } else {
            xDelta = SPACING / 4;
          }
        } else {
          if (res.prevX < res.nextX) {
            yDelta = -SPACING / 4;
          } else {
            yDelta = SPACING / 4;
          }
        }
        let noiseC = 4;

        exec(() => {
          scribble.scribbleLine(
            g,
            res.prevY * SPACING + DELTA + yDelta + startY + noiseC + WIDTH / 2,
            res.prevX * SPACING + DELTA + xDelta + startX + noiseC + HEIGHT / 2,
            res.nextY * SPACING + DELTA + yDelta + startY + noiseC + WIDTH / 2,
            res.nextX * SPACING + DELTA + xDelta + startX + noiseC + HEIGHT / 2
          );
        });
      }
    },
    [exec]
  );

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      let delta = HEIGHT / 3;
      drawShape(
        g,
        (r: number) => Math.acos(r),
        (theta: number) => Math.cos(theta),
        -delta,
        0,
        true
      );
      drawShape(
        g,
        (r) => r,
        (theta) => Math.asin(theta),
        0,
        0,
        true
      );
      drawShape(
        g,
        (r) => r,
        (theta) => Math.acos(theta),
        delta,
        0,
        false
      );
      append();
    },
    [append, drawShape]
  );

  return (
    <Container>
      <Sprite texture={textureRef.current} />
      <Graphics ref={graphicsRef} draw={draw} />
    </Container>
  );
};

export default Collatz2;
