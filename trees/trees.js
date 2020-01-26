/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="../util.js" />

const COLORSCHEME = COLORS.winterOrange;
const ALPHA = 'FF';

// Max x distance from trunk on either side
const MAX_X = 15;
// Branches cannot go more than n times higher than the trunk height
const MIN_Y_FACTOR = 2;
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
// Starting x coord to place trees
const START_X = 50;
// Starting y coord to place trees
const START_Y = 50;
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
// Max iterations before terminating generation
const MAX_ITERS = 1000;
// Noise threshold for choosing a bush
const BUSH_THRESH = 0.2;
// Min trunk height for bushes
const BUSH_MIN_HEIGHT = 5;
// Max trunk height for bushes
const BUSH_MAX_HEIGHT = 10;
const BUSH_VAR_X = 15;
const BUSH_VAR_Y = 15;

const TYPES = {
    normal: {
        xMean: 0,
        xStdDev: 7,
        yMean: -13,
        yStdDev: 3,
        minBranches: 10,
        maxBranches: 25,
        trunkPropensity: 0.1,
        maxBranchOffCount: 10,
        minSlopeThresh: 0.02,
        maxSlopeThresh: 0.5, 
        lineSelector: numLines => random(numLines - 1) 
    },
    skinny: {
        xMean: 0,
        xStdDev: 3,
        yMean: -10,
        yStdDev: 3,
        minBranches: 10,
        maxBranches: 20,
        trunkPropensity: 0.3,
        maxBranchOffCount: 10,
        minSlopeThresh: 0.02,
        maxSlopeThresh: 0.5, 
        lineSelector: numLines => random(numLines - 1)
    },
    fat: {
        xMean: 0,
        xStdDev: 7,
        yMean: -3,
        yStdDev: 2,
        minBranches: 20,
        maxBranches: 30,
        trunkPropensity: 0.7,
        maxBranchOffCount: 5,
        minSlopeThresh: 0.01,
        maxSlopeThresh: 0.01, 
        lineSelector: numLines => random(numLines - 1)
    }
}

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
    let iters = 0;
    let type = TYPES[random(Object.keys(TYPES))];
    let isBush = noise(x * X_NOISE_RATIO, y * Y_NOISE_RATIO) < BUSH_THRESH;
    let trunkHeight = random(isBush ? BUSH_MIN_HEIGHT : MIN_TRUNK_HEIGHT, isBush ? BUSH_MAX_HEIGHT : MAX_TRUNK_HEIGHT);
    // draw trunk
    line(x, y, x, y - trunkHeight);
    let trunk = {x1: x, y1: y, x2: x, y2: y - trunkHeight, branchCount: 0};
    let lines = [trunk];
    numBranches = random(type.minBranches, type.maxBranches);
    let yThreshFactorBottom = random(MIN_Y_THRESH_FACTOR_BOTTOM, MAX_Y_THRESH_FACTOR_BOTTOM);
    let yThreshFactorTop = random(MIN_Y_THRESH_FACTOR_TOP, MAX_Y_THRESH_FACTOR_TOP);
    let xThreshEnd = random(MIN_X_THRESH_END, MAX_X_THRESH_END);
    let slopeThresh = random(type.minSlopeThresh, type.maxSlopeThresh);

    while (lines.length < numBranches && iters < MAX_ITERS) {
        iters++;
        let availLines = lines.filter(l => l.branchCount < type.maxBranchOffCount).sort(l => l.y);
        let curLine = isBush || random() < type.trunkPropensity ? trunk : availLines[round(type.lineSelector(availLines.length))];
        if (curLine === undefined) {
            debugger;
        }
        // get a point on the line y = mx + b
        let slope = getSlope(curLine.x1, curLine.y1, curLine.x2, curLine.y2);
        let intercept = curLine.y1 - (slope * curLine.x1);
        let x1a = curLine.x1 + (xThreshEnd * (curLine.x2 - curLine.x1));
        let x1b = curLine.x2 - (xThreshEnd * (curLine.x2 - curLine.x1));
        let x1Max = max(x1a, x1b);
        let x1Min = min(x1a, x1b);
        let x1Diff = x1Max - x1Min;
        let x1 = limitedGaussian(x1Min + (x1Diff * 0.5), x1Diff, x1Min, x1Max);
        let y1a = curLine.y1 - (yThreshFactorBottom * (curLine.y1 - curLine.y2));
        let y1b = curLine.y2 + (yThreshFactorTop * (curLine.y1 - curLine.y2));
        let y1Max = max(y1a, y1b);
        let y1Min = min(y1a, y1b);
        let y1Diff = y1Max - y1Min;
        let y1 = (Math.abs(slope) === Infinity) 
            ? limitedGaussian(y1Min + (y1Diff * 0.5), y1Diff, y1Min, y1Max)
            : slope * x1 + intercept;
        let x2 = isBush ? x1 + random(-BUSH_VAR_Y, BUSH_VAR_X) : x1 + randomGaussian(type.xMean, type.xStdDev);
        let y2 = isBush ? y1 + random(-BUSH_VAR_Y, 0) : y1 + randomGaussian(type.yMean, type.yStdDev);

        if (x1 > x + MAX_X || x1 < x - MAX_X || y2 < y - (trunkHeight * MIN_Y_FACTOR)) {
            continue;
        }
        tooSimilar = false;
        if (!isBush) {
            let curSlope = getSlope(x1, y1, x2, y2);
            for (prevLine of lines) {
                prevSlope = getSlope(prevLine.x1, prevLine.y1, prevLine.x2, prevLine.y2);
                // Don't allow any lines to intersect, any two slopes to be too similar, or any two end points to be too close
                if (Math.abs(curSlope === Infinity)||
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
        }
        
        line(x1, y1, x2, y2);
        lines.push({x1, y1, x2, y2, branchCount: 0});
        curLine.branchCount++;
    }
}


