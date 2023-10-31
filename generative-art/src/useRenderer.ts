import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { useApp } from "@pixi/react";
import { button, useControls } from "leva";
import { useScreenshot } from "./useScreenshot";

export const useRenderer = () => {
  const app = useApp();
  const graphicsRef = useRef(new PIXI.Graphics());
  const textureRef = useRef(app.renderer.generateTexture(graphicsRef.current));
  const drawCount = useRef(0);

  const canvas = document.getElementsByTagName("canvas")[0];
  useScreenshot(canvas, canvas.width, canvas.height);

  const append = useCallback(() => {
    let texture = app.renderer.generateTexture(graphicsRef.current);
    textureRef.current = texture;

    graphicsRef.current = new PIXI.Graphics();
    drawCount.current = 0;
  }, [app.renderer]);

  const exec = useCallback(
    (graphicsFunc: () => void) => {
      graphicsFunc();

      if (drawCount.current >= 10000) {
        append();
      }
      drawCount.current += 1;
    },
    [append]
  );

  return { exec, append, textureRef, graphicsRef, app };
};
