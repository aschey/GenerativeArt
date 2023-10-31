import { button, useControls } from "leva";

export const useScreenshot = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  useControls({
    screenshot: button(() => {
      let newCanvas = document.createElement("canvas");
      newCanvas.width = width;
      newCanvas.height = height;
      let ctx = newCanvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, width, height);
      newCanvas.toBlob((blob) => {
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob!);

        link.setAttribute("download", "canvas.png");
        link.setAttribute("href", url);
        link.click();
        newCanvas.remove();
      });
    }),
  });
};
