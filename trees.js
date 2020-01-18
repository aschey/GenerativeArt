/// <reference path="node_modules/@types/p5/global.d.ts" />

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
const BG_DELTA_MIN = 2;
// Maximum change in x/y values when adding background textures
const BG_DELTA_MAX = 5;
// Line thickness
const THICKNESS = 2;
// alpha for all colors
const ALPHA = 'FF';

const bgColorDark = '#101C23';
const bgColorLight = '#233641'
const colors = ['#743A15', '#735C20', '#4A583B', '#2D473F', '#393E41'];


function setup() {
    createCanvas(windowWidth, windowHeight);
    strokeWeight(THICKNESS);
    background(bgColorDark);
    noLoop();
}

function draw() {
    drawBackground();

    for (let y = START_Y; y < height; y += START_Y) {
        for (let x = START_X; x < width; x += START_X) {
            drawTree(x + random(PLACE_VAR_MIN, PLACE_VAR_MAX), y + random(PLACE_VAR_MIN, PLACE_VAR_MAX), random(colors));
        }
    }
}

function drawBackground() {
    noiseDetail(NOISE_OCTAVES, NOISE_FALLOFF);
    for (let y = 0; y < height; y += random(BG_DELTA_MIN, BG_DELTA_MAX)) {
        for (let x = 0; x < width; x += random(BG_DELTA_MIN, BG_DELTA_MAX)) {
            let noiseVal = noise(x * X_NOISE_RATIO, y * Y_NOISE_RATIO);
            let val = colorGradient(bgColorDark, bgColorLight, noiseVal);
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
    let slopeThresh = random(SLOPE_THRESH_MIN, SLOPE_THRESH_MAX);
    while (lines.length < numBranches) {
        // get a point on the line y = mx + b
        let curLine = random(lines);
        let slope = getSlope(curLine.x1, curLine.y1, curLine.x2, curLine.y2);
        let intercept = curLine.y1 - (slope * curLine.x1);
        let x1 = random(curLine.x1, curLine.x2);
        let y1 = (slope === Infinity || slope === -Infinity) ? random(curLine.y1 - (yThreshFactorBottom * (curLine.y1 - curLine.y2)), curLine.y2 - (yThreshFactorTop * (curLine.y1 - curLine.y2))) : slope * x1 + intercept;
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
            if (intersects(x1, y1, x2, y2, prevLine.x1, prevLine.y1, prevLine.x2, prevLine.y2) || 
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

function intersects(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b) {
    var det, gamma, lambda;
    det = (x2a - x1a) * (y2b - y1b) - (x2b - x1b) * (y2a - y1a);
    if (det === 0) {
        return false;
    } 
    else {
        lambda = ((y2b - y1b) * (x2b - x1a) + (x1b - x2b) * (y2b - y1a)) / det;
        gamma = ((y1a - y2a) * (x2b - x1a) + (x2a - x1a) * (y2b - y1a)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
};

function getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getColorInt(hexColorString, pos) {
    return parseInt(hexColorString.substr(pos * 2, 2), 16);
}

function hexStringToInts(hexColorString) {
    // Remove leading #
    let valsOnly = hexColorString.slice(1, hexColorString.length);
    return _.range(3).map(i => getColorInt(valsOnly, i));
}

function getNewColorVal(startVal, colorDiff, percent) {
    return ((colorDiff * percent) + startVal).toString(16).split('.')[0].padStart(2, '0');
}

function colorGradient(startColor, endColor, percent) {
    // get colors
    let startInts = hexStringToInts(startColor);
    let endInts = hexStringToInts(endColor);

    // calculate new color
    let newVals = startInts.map((startVal, i) => getNewColorVal(startVal, endInts[i] - startVal, percent));

    return `#${newVals.join('')}`;
};