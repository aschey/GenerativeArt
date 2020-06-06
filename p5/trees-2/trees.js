/// <reference path="../util.js" />
/// <reference path="./consts.js" />

document.addEventListener("DOMContentLoaded", async function() {
    startPerfTimer();
    //p5 = new window.p5(sketch => sketch.setup = () => sketch.createCanvas(0, 0));
    const width = window.innerWidth;
    const height = window.innerHeight;
    const app = new PIXI.Application({width, height, antialias: true});
    window.app = app;
    app.renderer.preserveDrawingBuffer = true;
    document.body.appendChild(app.view);
    app.renderer.backgroundColor = getColorInt(COLORSCHEME.background1);

    drawBackground(app, width, height);
    let res = await worker(_.range(START_Y, height + START_Y, START_Y), 'trees.worker.js', (drawTrees, startY, endY) =>  
        drawTrees(START_X, width, startY, endY));
    

    let graphics = new PIXI.Graphics();
    for (let group of res) {
        for (let tree of group) {

            graphics.lineStyle(THICKNESS, getColorInt(random(COLORSCHEME.colors)));
            for (let treeLine of tree) {
                graphics.moveTo(treeLine.x1, treeLine.y1);
                graphics.lineTo(treeLine.x2, treeLine.y2);
            }
            
        }
    }
    app.stage.addChild(graphics);
    endPerfTimer();

  });

function perlin(x, y, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (var i = 0; i < octaves; i++) {
        total += noise.perlin2(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }
    return (total/maxValue + 1) * 0.5;
}

function perlin2(x, y, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (var i = 0; i < octaves; i++) {
        total += Math.abs(noise.perlin2(x * frequency, y * frequency)) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }
    
    return Math.min(total/maxValue * 2, 1.0);
}
function drawBackground(app, width, height) {
    let count = 0;
    let graphics = new PIXI.Graphics();
    cRange2d(0, height, 1, 0, width, 1).map(pair => {
        pair.x += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);
        pair.y += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);
        
        let noiseVal = perlin2(pair.x * X_NOISE_RATIO, pair.y * Y_NOISE_RATIO, 1, NOISE_FALLOFF);

        let val = colorGradient(COLORSCHEME.background1, COLORSCHEME.background2, noiseVal);
        graphics.beginFill(getColorInt(val));
        graphics.drawRect(pair.x, pair.y + random(noiseVal * NOISE_POINT_VAR_MIN, noiseVal * NOISE_POINT_VAR_MAX), 1, 1);
        graphics.endFill();
        if (count % 10000 === 0) {
            app.stage.addChild(graphics);
            graphics = new PIXI.Graphics();
        }
        count++;
    });
    app.stage.addChild(graphics);
}

