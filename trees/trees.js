/// <reference path="../util/util.js" />
/// <reference path="./consts.js" />

document.addEventListener('DOMContentLoaded', async function () {
  startPerfTimer();
  const manager = new AppManager();
  const app = manager.app;
  const width = manager.width;
  const height = manager.height;

  app.renderer.backgroundColor = getColorInt(COLORSCHEME.background1);

  drawBackground(manager, width, height);
  endPerfTimer();
  startPerfTimer();
  let res = await worker(_.range(START_Y, height + START_Y, START_Y), 'trees.worker.js', (drawTrees, startY, endY) =>
    drawTrees(START_X, width, startY, endY)
  );

  for (let group of res) {
    for (let tree of group) {
      manager.graphics.lineStyle(THICKNESS, getColorInt(random(COLORSCHEME.colors)));
      for (let treeLine of tree) {
        manager.exec(g => {
          g.moveTo(treeLine.x1, treeLine.y1);
          g.lineTo(treeLine.x2, treeLine.y2);
        });
      }
    }
  }
  manager.append();
  endPerfTimer();
});

function drawBackground(manager, width, height) {
  cRange2d(0, height, 1, 0, width, 1).map(pair => {
    pair.x += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);
    pair.y += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);

    let noiseVal = perlin2(pair.x * X_NOISE_RATIO, pair.y * Y_NOISE_RATIO, 1, NOISE_FALLOFF);

    let val = colorGradient(COLORSCHEME.background1, COLORSCHEME.background2, noiseVal);
    manager.exec(g => {
      g.beginFill(getColorInt(val));
      g.drawRect(pair.x, pair.y + random(noiseVal * NOISE_POINT_VAR_MIN, noiseVal * NOISE_POINT_VAR_MAX), 1, 1);
      g.endFill();
    });
  });
  manager.append();
}
