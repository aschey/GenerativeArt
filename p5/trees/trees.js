/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="../util.js" />
let pg;
function setup() {
    startPerfTimer();
    createCanvas(windowWidth, windowHeight);
    pg = createGraphics(windowWidth, windowHeight);
    background(COLORSCHEME.background1);
    noLoop();
}

function drawBackground() {
    let iters = 0;
    strokeWeight(BG_THICKNESS);
    noiseDetail(NOISE_OCTAVES, NOISE_FALLOFF);
    
    cRange2d(0, height, 1, 0, width, 1).map(pair => {
        pair.x += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);
        pair.y += random(BG_DELTA_MIN - 1, BG_DELTA_MAX - 1);
        let noiseVal = noise(pair.x * X_NOISE_RATIO, pair.y * Y_NOISE_RATIO);
        let val = colorGradient(COLORSCHEME.background1, COLORSCHEME.background2, noiseVal);
        stroke(val + ALPHA);
        point(pair.x, pair.y + random(noiseVal * NOISE_POINT_VAR_MIN, noiseVal * NOISE_POINT_VAR_MAX));
    });
    
    //image(pg, 0, 0);
    // for (let y = 0; y < height; y += random(BG_DELTA_MIN, BG_DELTA_MAX)) {
    //     for (let x = 0; x < width; x += random(BG_DELTA_MIN, BG_DELTA_MAX)) {
    //         console.log(x, y);
    //         let noiseVal = noise(x * X_NOISE_RATIO, y * Y_NOISE_RATIO);
    //         let val = colorGradient(COLORSCHEME.background1, COLORSCHEME.background2, noiseVal);
    //         stroke(val + ALPHA);
    //         point(x, y + random(noiseVal * NOISE_POINT_VAR_MIN, noiseVal * NOISE_POINT_VAR_MAX));
    //         iters++;
    //     }
    // }
    //console.log(iters);
}

async function draw() {
    drawBackground();
    strokeWeight(THICKNESS);
    //let ranges = [];
    // for (let y = START_Y; y < height + START_Y; y += START_Y) {
    //     ranges.push(y);
    // }
    //ranges.push(height);
    //ranges.push(height + 1);
    let res = await worker(_.range(START_Y, height + START_Y, START_Y), 'trees.worker.js', (drawTrees, startY, endY) => {
        //console.log(startY, endY);
        return drawTrees(START_X, width, startY, endY)
    });
    for (let group of res) {
        for (let tree of group) {
            stroke(random(COLORSCHEME.colors) + ALPHA);
            for (let treeLine of tree) {
                line(treeLine.x1, treeLine.y1, treeLine.x2, treeLine.y2);
            }
            
        }
    }
    endPerfTimer();
}