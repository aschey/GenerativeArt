/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="../util.js" />

const COLORSCHEME = COLORS.autumn;
const ALPHA = 'AA';

// mean for gauss randomization of lines
const LINE_MEAN = 0;
// std dev for gauss randomization of lines
const LINE_STD_DEV = 4;
// start collatz number
const START_N = 0;
// end collatz number
const END_N = 500;
// line color alpha

// probability of choosing a colored line
const COLOR_LINE_PROB = 0.2;
// coefficient to pass to noise() for x and y coords
const LINE_NOISE_RATIO = 0.2;
// change in x values when creating background texture
const BG_DELTA_X = 10;
// change in y values when creating background texture
const BG_DELTA_Y = 10;
// variance when choosing background coords
const BG_VAR = 5;
// background starting color
const BG_BASE_COLOR = 100;
// gaussian mean for background color adjustment percentage (0 - 1.0)
const BG_MEAN = 0.7;
// gaussian std dev for background color adjustment percentage (0 - 1.0)
const BG_STD_DEV = 0.2;
// start y value for adding fill squares
const SQUARES_START_Y = 25;
// change in y value for adding fill squares
const SQUARES_DELTA_Y = 25;
// change in x value for adding fill squares
const SQUARES_DELTA_X = 25;
// variance when choosing coords for fill squares
const SQUARES_VAR = 12;
const MAX_SQUARE_SIDE = 100;
const IGNORE_DIAG_LENGTH = 10;
const IGNORE_DIAG_LOWER_SLOPE = 0.05;
const IGNORE_DIAG_UPPER_SLOPE = 10;

let minBgVals = null;
let maxBgVals = null;
// calculated below, need to wait until setup is called
let PIXEL_DENSITY = null;

document.addEventListener("DOMContentLoaded", async function() {
    //PIXEL_DENSITY = pixelDensity();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const app = new PIXI.Application({width, height, antialias: true});
    window.app = app;
    app.renderer.preserveDrawingBuffer = true;
    document.body.appendChild(app.view);
    app.renderer.backgroundColor = getColorInt(COLORSCHEME.background1);

    let bg1Vals = hexStringToInts(COLORSCHEME.background1);
    let bg2Vals = hexStringToInts(COLORSCHEME.background2);
    minBgVals = bg1Vals.map((v, i) => Math.min(v, bg2Vals[i]));
    maxBgVals = bg1Vals.map((v, i) => Math.max(v, bg2Vals[i]));

    let count = 0;
    let graphics = new PIXI.Graphics();
    for (let y = BG_DELTA_Y; y < height; y += BG_DELTA_Y) {
        for (let x = BG_DELTA_X; x < width; x += BG_DELTA_X) {
            let dotColor = colorGradientGaussian(COLORSCHEME.background1, COLORSCHEME.background2, BG_MEAN, BG_STD_DEV);
            graphics.beginFill(getColorInt(dotColor));
            graphics.drawRect(x + equiRandom(BG_VAR), y + equiRandom(BG_VAR), 1, 1);
            if (count % 10000 === 0) {
                app.stage.addChild(graphics);
                graphics = new PIXI.Graphics();
            }
            count++;
        }
    }
    app.stage.addChild(graphics);
    //noLoop();
});
function draw() {
    for (let res of doCollatz()) {
        if (random() < res.prevY / height) {
            stroke(random(COLORSCHEME.colors) + ALPHA);
            line(res.prevX, res.prevY, res.nextX, res.nextY);
        }
        else {
            stroke(colorGradient(COLORSCHEME.foreground1, COLORSCHEME.foreground2, noise(res.val * LINE_NOISE_RATIO, res.val * LINE_NOISE_RATIO)));
            let gx = lineGauss();
            let gy = lineGauss();
            line(res.prevX + gx, res.prevY + gy, res.nextX + gx, res.nextY + gy);
        }
        
    }
    for (let res of doCollatz()) {
        if (random() < COLOR_LINE_PROB) {
            stroke(random(COLORSCHEME.colors) + ALPHA);
            line(2 * height - res.prevX, height - res.prevY, 2 * height - res.nextX, height - res.nextY);
        }
        
    }
    
    loadPixels();
    noStroke();
    for (let y = SQUARES_START_Y; y < height; y += SQUARES_DELTA_Y) {
        for (let x = y * 2 + SQUARES_VAR; x < width; x += SQUARES_DELTA_X) {
            let adjX = x + round(equiRandom(SQUARES_VAR));
            let adjY = y + round(equiRandom(SQUARES_VAR));
            if (checkPixelColor(adjX, adjY)) {
                let points = scanlineSeedFilling(adjX, adjY, isBackground);
                let res = grahamScan(points);
                if (res.length > 3) {
                    drawFill(res);
                }
            }
            
        }
    }
}

function* doCollatz() {
    for (let i = START_N; i < END_N; i++) {
        let prevX = i;
        let prevY = i;
        let prev = i;
        
        for (let next of genCollatz(i)) {
            let nextX = prevX;
            let nextY = prevY;
            if (prev % 2 == 0) {
                nextY = next; 
            }
            else {
                nextX = next;
            }
            
            yield {prevX, prevY, nextX, nextY, val: i};

            prevX = nextX;
            prevY = nextY;
            prev = next;
        }
    }
}

function checkPixelColor(x, y) {
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
    if (x === width || x - minX > MAX_SQUARE_SIDE) {
        return false;
    }
    x--;

    for (; isBackground(x, y); y++);
    if (y === height || y - minY > MAX_SQUARE_SIDE) {
        return false;
    }
    y--;

    let maxX = x;
    let maxY = y;
    x = minX;
    y = minY;
    for (; y < height && isBackground(x, y); y++);
    
    if (x === width || x - minX > MAX_SQUARE_SIDE) {
        return false;
    }
    y--;

    for (; x < width && isBackground(x, y); x++);
    x--;
    
    if (Math.abs(x - maxX) > 0 || Math.abs(y - maxY > 0)) {
        return false;
    }

    return true;
}

function drawFill(res) {
    fill(random(COLORSCHEME.colors) + ALPHA);
    for (let i = 0; i < res.length; i++) {
        let cur = res[i];
        let next = res[i === res.length - 1 ? 0 : i + 1];
        let slope = Math.abs(getSlope(cur.x, cur.y, next.x, next.y));
        // Don't draw shapes with large diagonal lines
        if (slope !== Infinity && 
            distance(cur.x, cur.y, next.x, next.y) > IGNORE_DIAG_LENGTH && 
            slope > IGNORE_DIAG_LOWER_SLOPE && slope < IGNORE_DIAG_UPPER_SLOPE) {
            return;
        }
    }
    beginShape();
    for (let p of res) {
        vertex(p.x, p.y);
    }
    endShape();
    loadPixels();
}

const isBackground = (x, y) => x < width && y < height && getPixel(x, y, PIXEL_DENSITY).every((d, i) => d >= minBgVals[i] && d <= maxBgVals[i]);

function lineGauss() {
    return round(randomGaussian(LINE_MEAN, LINE_STD_DEV));
}

function* genCollatz(n) {
    let current = n;
    while (current > 1) {
        if (current % 2 == 0) {
            current /= 2;
        }
        else {
            current = current * 3 + 1;
        }
        yield current;
    }
}

