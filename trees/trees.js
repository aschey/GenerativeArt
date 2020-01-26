/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="../util.js" />

const COLORSCHEME = COLORS.winterOrange;
const ALPHA = 'FF';

// Max x distance from trunk on either side
const MAX_X = 15;
// Branches cannot go more than n times higher than the trunk height
const MIN_Y_FACTOR = 2;
// Max amount to add/subtract from the x value each time
const X_VAR = 15;
// Max amount to subtract from the y value each time
const Y_VAR = 15;
// Branches off the trunk can start no less than n * trunkHeight from the base of the trunk
const MIN_Y_THRESH_FACTOR_BOTTOM = 0.1;
// Branches off the trunk can start no more than n * trunkHeight from the base of the trunk
const MAX_Y_THRESH_FACTOR_BOTTOM = 0.5;
// Branches off the trunk can end no less than n * trunkHeight from the base of the trunk
const MIN_Y_THRESH_FACTOR_TOP = 0.05;
// Branches off the trunk can end no more than n * trunkHeight from the base of the trunk
const MAX_Y_THRESH_FACTOR_TOP = 0.1;
// Min percentage of the end of the branch to allow creating new branches off of
const MIN_X_THRESH_END = 0.1;
// Max percentage of the end of the branch to allow creating new branches off of
const MAX_X_THRESH_END = 0.7;
// Minimum variance from START_X or START_Y to place a new tree
const PLACE_VAR_MIN = -10;
// Maximum variance from START_X or START_Y to place a new tree
const PLACE_VAR_MAX = 20;
// Minimum trunk height
const MIN_TRUNK_HEIGHT = 20;
// Maximum trunk height
const MAX_TRUNK_HEIGHT = 50;
// Minimum branches per tree
const MIN_BRANCHES = 10;
// Maximum branches per tree
const MAX_BRANCHES = 25;
// Starting x coord to place trees
const START_X = 50;
// Starting y coord to place trees
const START_Y = 50;
// Minimum similarity ratio for branch slopes within the same tree
const SLOPE_THRESH_MIN = 0.2;
// Maximum similarity ratio for branch slopes within the same tree
const SLOPE_THRESH_MAX = 0.5;
// Minimum amount of distance allowed between branches
const DIST_THRESH = 4;
// Factor to multiply x value by when calculating Perlin noise
const X_NOISE_RATIO = 0.01;
// Factor to multiply y value by when calculating Perlin noise
const Y_NOISE_RATIO = 0.1;
// Number of octaves to use for Perlin noise
const NOISE_OCTAVES = 4;
// Factor to use for Perlin noise falloff
const NOISE_FALLOFF = 0.2;
// Minimum variance to multiply the noise value by when applying y variance
const NOISE_POINT_VAR_MIN = -2;
// Maximum variance to multiply the noise value by when applying y variance
const NOISE_POINT_VAR_MAX = 5
// Minimum change in x/y values when adding background textures
const BG_DELTA_MIN = 1;
// Maximum change in x/y values when adding background textures
const BG_DELTA_MAX = 2;
// Line thickness
const THICKNESS = 2;
// Background texture thickness
const BG_THICKNESS = 1;
// alpha for all colors


function setup() {
    createCanvas(windowWidth, windowHeight);

    background(COLORSCHEME.background1);
    noLoop();
}

function draw() {
    drawBackground();
    strokeWeight(THICKNESS);
    for (let y = START_Y; y < height; y += START_Y) {
        for (let x = START_X; x < width; x += START_X) {
            drawTree(x + random(PLACE_VAR_MIN, PLACE_VAR_MAX), y + random(PLACE_VAR_MIN, PLACE_VAR_MAX), random(COLORSCHEME.colors));
        }
    }
}

function drawBackground() {
    strokeWeight(BG_THICKNESS);
    noiseDetail(NOISE_OCTAVES, NOISE_FALLOFF);
    for (let y = 0; y < height; y += random(BG_DELTA_MIN, BG_DELTA_MAX)) {
        for (let x = 0; x < width; x += random(BG_DELTA_MIN, BG_DELTA_MAX)) {
            let noiseVal = noise(x * X_NOISE_RATIO, y * Y_NOISE_RATIO);
            let val = colorGradient(COLORSCHEME.background1, COLORSCHEME.background2, noiseVal);
            stroke(val + ALPHA);
            point(x, y + random(noiseVal * NOISE_POINT_VAR_MIN, noiseVal * NOISE_POINT_VAR_MAX));
        }
    }
}

function drawTree(x, y, color) {
    stroke(color + ALPHA);
    let trunkHeight = random(MIN_TRUNK_HEIGHT, MAX_TRUNK_HEIGHT);
    // draw trunk
    line(x, y, x, y - trunkHeight);

    lines = [{x1: x, y1: y, x2: x, y2: y - trunkHeight}];
    numBranches = random(MIN_BRANCHES, MAX_BRANCHES);
    let yThreshFactorBottom = random(MIN_Y_THRESH_FACTOR_BOTTOM, MAX_Y_THRESH_FACTOR_BOTTOM);
    let yThreshFactorTop = random(MIN_Y_THRESH_FACTOR_TOP, MAX_Y_THRESH_FACTOR_TOP);
    let xThreshEnd = random(MIN_X_THRESH_END, MAX_X_THRESH_END);
    let slopeThresh = random(SLOPE_THRESH_MIN, SLOPE_THRESH_MAX);
    while (lines.length < numBranches) {
        // get a point on the line y = mx + b
        let curLine = random(lines);
        let slope = getSlope(curLine.x1, curLine.y1, curLine.x2, curLine.y2);
        let intercept = curLine.y1 - (slope * curLine.x1);
        let x1 = random(curLine.x1 + (xThreshEnd * (curLine.x2 - curLine.x1)), curLine.x2 - (xThreshEnd * (curLine.x2 - curLine.x1)));
        let y1 = (slope === Infinity || slope === -Infinity) 
            ? random(curLine.y1 - (yThreshFactorBottom * (curLine.y1 - curLine.y2)), curLine.y2 + (yThreshFactorTop * (curLine.y1 - curLine.y2))) 
            : slope * x1 + intercept;
        let x2 = x1 + random(-X_VAR, X_VAR);
        let y2 = y1 + random(-Y_VAR, 0);

        if (x1 > x + MAX_X || x1 < x - MAX_X || y2 < y - (trunkHeight * MIN_Y_FACTOR)) {
            continue;
        }
        tooSimilar = false;
        let curSlope = getSlope(x1, y1, x2, y2);
        for (prevLine of lines) {
            prevSlope = getSlope(prevLine.x1, prevLine.y1, prevLine.x2, prevLine.y2);
            // Don't allow any lines to intersect, any two slopes to be too similar, or any two end points to be too close
            if (curSlope === Infinity || curSlope === -Infinity ||
                intersects(x1, y1, x2, y2, prevLine.x1, prevLine.y1, prevLine.x2, prevLine.y2) || 
                prevSlope - slopeThresh <= curSlope && curSlope <= prevSlope + slopeThresh ||
                distance(x2, y2, prevLine.x2, prevLine.y2) < DIST_THRESH) {
                tooSimilar = true;
                break;
            }
        };
        if (tooSimilar) {
            continue;
        }
        line(x1, y1, x2, y2);
        lines.push({x1, y1, x2, y2});
    }
}


