/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="../util.js" />

// background color
const BACKGROUND = 40;
// mean for gauss randomization of lines
const LINE_MEAN = 0;
// std dev for gauss randomization of lines
const LINE_STD_DEV = 4;
// start collatz number
const START_N = 200;
// end collatz number
const END_N = 500;
// line color alpha
const ALPHA = 'AA';
// line color start
const LINE_COLOR_1 = '#DDDDDD';
// line color end
const LINE_COLOR_2 = '#AAAAAA';
// probability of choosing a colored line
const COLOR_LINE_PROB = 0.1;
// coefficient to pass to noise() for x and y coords
const LINE_NOISE_RATIO = 0.2;

const FILL_COLORS = ['#7DDF64', '#C0DF85', '#DEB986', '#DB6C79', '#ED4D6E'];
// change in x values when creating background texture
const BG_DELTA_X = 10;
// change in y values when creating background texture
const BG_DELTA_Y = 10;
// variance when choosing background coords
const BG_VAR = 5;
// background starting color
const BG_BASE_COLOR = 50;
// gaussian mean for background
const BG_MEAN = 10;
// gaussian std dev for background
const BG_STD_DEV = 5;
// start y value for adding fill squares
const SQUARES_START_Y = 50;
// change in y value for adding fill squares
const SQUARES_DELTA_Y = 10;
// change in x value for adding fill squares
const SQUARES_DELTA_X = 10;
// variance when choosing coords for fill squares
const SQUARES_VAR = 5;
// value to add to the y value when starting a new row of fill squares
const SQUARES_ADJ_X = 500;
const IGNORE_DIAG_LENGTH = 10;
const IGNORE_DIAG_LOWER_SLOPE = 0.05;
const IGNORE_DIAG_UPPER_SLOPE = 10;

const BG_MAX_COLOR = BG_BASE_COLOR + BG_MEAN + BG_STD_DEV * 2;
// calculated below, need to wait until setup is called
let PIXEL_DENSITY = null;

function setup() {
    createCanvas(windowWidth, windowHeight);
    PIXEL_DENSITY = pixelDensity();
    background(BACKGROUND);
    let maxPixelVal = BG_BASE_COLOR + BG_MEAN + BG_STD_DEV * 2;
    for (let y = BG_DELTA_Y; y < height; y += BG_DELTA_Y) {
        for (let x = BG_DELTA_X; x < width; x += BG_DELTA_X) {
            let dotColor = BG_BASE_COLOR + randomGaussian(BG_MEAN, BG_STD_DEV);
            if (dotColor > BG_MAX_COLOR) {
                dotColor = BG_MAX_COLOR;
            }
            if (dotColor < BG_BASE_COLOR) {
                dotColor = BG_BASE_COLOR;
            }
            stroke(dotColor);
            point(x + equiRandom(BG_VAR), y + equiRandom(BG_VAR));
            
        }
    }
    
    noLoop();
}
function draw() {
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
            

            if (random() <= COLOR_LINE_PROB) {
                stroke(colorGradient(LINE_COLOR_1, LINE_COLOR_2, noise(i * LINE_NOISE_RATIO, i * LINE_NOISE_RATIO)));
                line(prevX, prevY, nextX, nextY);
                stroke(random(FILL_COLORS) + ALPHA);
                line(prevX, prevY, nextX, nextY);
            }
            else {
                stroke(colorGradient(LINE_COLOR_1, LINE_COLOR_2, noise(i * LINE_NOISE_RATIO, i * LINE_NOISE_RATIO)));
                line(prevX + lineGauss(), prevY + lineGauss(), nextX + lineGauss(), nextY + lineGauss());
            }

            
            
            prevX = nextX;
            prevY = nextY;
            prev = next;
        }
    }
    loadPixels();
    noStroke();
    for (let y = SQUARES_START_Y; y < height; y += SQUARES_DELTA_Y) {
        for (let x = y + SQUARES_ADJ_X; x < width; x += SQUARES_DELTA_X) {
            let adjX = x + round(equiRandom(SQUARES_VAR));
            let adjY = y + round(equiRandom(SQUARES_VAR));
            if (checkPixelColor(adjX, adjY)) {
                let points = scanlineSeedFilling(adjX, adjY, isBackground);
                let res = grahamScan(points);
                drawFill(res);
            }
            
        }
    }
}

function checkPixelColor(x, y) {
    let origX = x;
    let origY = y;
    if (!isBackground(x, y)) {
        return false;
    }
    while (x > 0 && isBackground(x, y)) {
        x--;
    }
    if (x === 0 || origX - x > 100) {
        return false;
    }
    x++;
    data = getPixel(x, y, PIXEL_DENSITY);
    while (y > 0 && isBackground(x, y)) {
        y--;
    }
    if (y === 0 || origY - y > 100) {
        return false;
    }
    y++;
    topLeft = {x, y};
    while (x < width && isBackground(x, y)) {
        x++;
        data = getPixel(x, y, PIXEL_DENSITY);
    }
    if (x === width || x - topLeft.x > 100) {
        return false;
    }
    x--;
    while (y < height && isBackground(x, y)) {
        y++;
    }
    if (y === height || y - topLeft.y > 100) {
        return false;
    }
    y--;

    if (x - topLeft.x > 200 || y - topLeft.y > 200 || (x - topLeft.x) / (y - topLeft.y) > 10 || (y - topLeft.y) / (x - topLeft.x) > 10) {
        return false;
    }

    maxX1 = x;
    maxY1 = y;
    x = topLeft.x;
    y = topLeft.y;
    while (y < height && isBackground(x, y)) {
        y++;
    }
    
    if (x === width || x - topLeft.x > 100) {
        return false;
    }
    y--;
    while (x < width && isBackground(x, y)) {
        x++;
    }
    x--;
    if (Math.abs(x - maxX1) > 1 || Math.abs(y - maxY1 > 1)) {
        return false;
    }

    return true;
}

function drawFill(res) {
    fill(random(FILL_COLORS) + ALPHA);
    for (let i = 0; i < res.length; i++) {
        let cur = res[i];
        let next = res[i === res.length - 1 ? 0 : i + 1];
        let slope = getSlope(cur.x, cur.y, next.x, next.y);
        // Don't draw shapes with large diagonal lines
        if (slope !== -Infinity && slope !== Infinity && 
            distance(cur.x, cur.y, next.x, next.y) > IGNORE_DIAG_LENGTH && 
            Math.abs(slope) > IGNORE_DIAG_LOWER_SLOPE && Math.abs(slope) < IGNORE_DIAG_UPPER_SLOPE) {
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

function isBackground(x, y) {
    return !getPixel(x, y, PIXEL_DENSITY).some(d => d !== 255 && d !== BACKGROUND && (d < BG_BASE_COLOR || d > BG_MAX_COLOR))
}


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

