"use client";
// @refresh reset

import { getColorInt } from "@/colorUtil";
import { Container, Graphics, Sprite, Stage } from "@pixi/react";
import {
  COLORSCHEME,
  NOISE_POINT_VAR_MAX,
  NOISE_POINT_VAR_MIN,
  START_X,
  START_Y,
  THICKNESS,
} from "./consts";
import { useRenderer } from "@/useRenderer";
import { useCallback } from "react";
import * as PIXI from "pixi.js";
import {
  Coord,
  endPerfTimer,
  random,
  randomSample,
  startPerfTimer,
  worker,
} from "@/util";
import { DrawResult } from "./trees.worker";

let width = 0;
let height = 0;

if (typeof window !== "undefined") {
  width = window.innerWidth;
  height = window.innerHeight;
}

const Trees: React.FC<{}> = () => {
  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: getColorInt(COLORSCHEME.background1),
        antialias: true,
        preserveDrawingBuffer: true,
      }}
    >
      <TreesInner />
    </Stage>
  );
};

const TreesInner: React.FC<{}> = () => {
  const { exec, append, textureRef, graphicsRef } = useRenderer();

  const draw = useCallback(
    async (g: PIXI.Graphics) => {
      startPerfTimer();
      let bgTasks = worker<any, [number, string, Coord][]>(
        _.range(0, height),
        () => new Worker(new URL("./trees.worker.ts", import.meta.url)),
        (module: any, startY, endY) =>
          module.getSnowColors(startY, endY, width),
        Math.ceil((navigator.hardwareConcurrency - 1) * 0.8)
      );
      let treeTasks = worker<any, DrawResult[][]>(
        _.range(START_Y, height + START_Y, START_Y),
        () => new Worker(new URL("./trees.worker.ts", import.meta.url)),
        (module: any, startY, endY) =>
          module.drawTrees(START_X, width, startY, endY),
        Math.ceil((navigator.hardwareConcurrency - 1) * 0.2)
      );

      let bgDraw = [];
      for (let t of bgTasks) {
        bgDraw.push(
          t.then((r) => {
            for (let [noiseVal, color, pair] of r) {
              exec(() => {
                g.beginFill(getColorInt(color));
                g.drawRect(
                  pair.x,
                  pair.y +
                    random(
                      noiseVal * NOISE_POINT_VAR_MIN,
                      noiseVal * NOISE_POINT_VAR_MAX
                    ),
                  1,
                  1
                );
                g.endFill();
              });
            }
          })
        );
      }

      await Promise.all(bgDraw);

      let tDraw = [];
      for (let t of treeTasks) {
        tDraw.push(
          t.then((group) => {
            for (let tree of group) {
              g.lineStyle(
                THICKNESS,
                getColorInt(randomSample(COLORSCHEME.colors))
              );
              for (let treeLine of tree) {
                exec(() => {
                  g.moveTo(treeLine.x1, treeLine.y1);
                  g.lineTo(treeLine.x2, treeLine.y2);
                });
              }
            }
          })
        );
      }

      await Promise.all(tDraw);
      endPerfTimer();
      append();
    },
    [append, exec]
  );

  return (
    <Container>
      <Sprite texture={textureRef.current} />
      <Graphics ref={graphicsRef} draw={draw} />
    </Container>
  );
};

export default Trees;
