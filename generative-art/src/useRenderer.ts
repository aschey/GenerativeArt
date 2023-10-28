import { useCallback, useMemo, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { useApp } from "@pixi/react";
import { button, useControls } from "leva";

export const useRenderer = () => {
  const app = useApp();
  const graphicsRef = useRef(new PIXI.Graphics());
  const textureRef = useRef(app.renderer.generateTexture(graphicsRef.current));
  const drawCount = useRef(0);

  const handleScreenshot = useCallback(async () => {
    const texture = app.renderer.generateTexture(app.stage, {
      region: app.screen,
      resolution: 2,
    });
    const data = await app.renderer.extract.base64(texture);
    const link = document.createElement("a");
    link.setAttribute("download", "canvas.png");
    link.setAttribute("href", data);
    link.click();
  }, [app.renderer, app.stage, app.screen]);

  useControls({
    screenshot: button(() => {
      let gl = document.getElementsByTagName("canvas")[0];
      let url = gl.toDataURL();
      const link = document.createElement("a");
      link.setAttribute("download", "canvas.png");
      link.setAttribute("href", url);
      link.click();
    }),
  });

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
