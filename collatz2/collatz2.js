const scribble = new Scribble();

document.addEventListener('DOMContentLoaded', async function () {
  //const manager = new AppManager(Math.max(window.innerWidth, 6000 * SPACING));
  const manager = new AppManager(800, 2000);
  const app = manager.app;
  const width = manager.width;
  const height = manager.height;

  app.renderer.backgroundColor = getColorInt(BACKGROUND);
  await draw(manager, width, height);
});

async function draw(manager, width, height) {
  let delta = height / 3;
  drawShape(
    manager,
    width,
    height,
    r => Math.acos(r),
    theta => Math.cos(theta),
    -delta,
    0,
    true
  );
  drawShape(
    manager,
    width,
    height,
    r => r,
    theta => Math.asin(theta),
    0,
    0,
    true
  );
  drawShape(
    manager,
    width,
    height,
    r => r,
    theta => Math.acos(theta),
    delta,
    0,
    false
  );
  manager.append();
}

function drawShape(manager, width, height, fr, ftheta, startX, startY, convert) {
  for (let res of doCollatz(fr, ftheta, convert)) {
    let xDelta = 0;
    let yDelta = 0;
    manager.graphics.lineStyle(1, getColorInt(colorGradientGaussian(FOREGROUND1, FOREGROUND2, BG_MEAN, BG_STD_DEV)));
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

    manager.exec(g => {
      scribble.scribbleLine(
        g,
        res.prevY * SPACING + DELTA + yDelta + startY + noiseC + width / 2,
        res.prevX * SPACING + DELTA + xDelta + startX + noiseC + height / 2,
        res.nextY * SPACING + DELTA + yDelta + startY + noiseC + width / 2,
        res.nextX * SPACING + DELTA + xDelta + startX + noiseC + height / 2
      );
    });
  }
}
function* doCollatz(fr, ftheta, convert) {
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

      yield {
        prevX: prevR * Math.cos(conversion * prevTheta),
        prevY: prevR * Math.sin(conversion * prevTheta),
        nextX: nextR * Math.cos(conversion * nextTheta),
        nextY: nextR * Math.sin(conversion * nextTheta),
        val: i,
        current: next,
      };

      prevR = nextR;
      prevTheta = nextTheta;
      prev = next;
    }
  }
}

function* genCollatz(n) {
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
