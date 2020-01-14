/// <reference path="node_modules/@types/p5/global.d.ts" />

const MAX_X = 10;
const MIN_Y_FACTOR = 2;
const X_VAR = 15;
const Y_VAR = 15;
const MIN_Y_THRESH_FACTOR_BOTTOM = 0.1;
const MAX_Y_THRESH_FACTOR_BOTTOM = 0.5;
const MIN_Y_THRESH_FACTOR_TOP = 0.05;
const MAX_Y_THRESH_FACTOR_TOP = 0.1;
const PLACE_VAR_MIN = -10;
const PLACE_VAR_MAX = 20;
const MIN_TRUNK_HEIGHT = 20;
const MAX_TRUNK_HEIGHT = 50;
const MIN_BRANCHES = 10;
const MAX_BRANCHES = 25;
const START_X = 50;
const START_Y = 50;
const SLOPE_THRESH_MIN = 0.2;
const SLOPE_THRESH_MAX = 0.5;
const DIST_THRESH = 4;

const thickness = 2;
const bgColor = '#101C23'
const colors = ['#743A15', '#735C20', '#4A583B', '#2D473F', '#393E41']
const alpha = 'FF';

function setup() {
    createCanvas(windowWidth, windowHeight);
    strokeWeight(thickness);
    background(bgColor);
    noLoop();
}

async function draw() {
    for (let y = START_Y; y < height; y += START_Y) {
        for (let x = START_X; x < width; x += START_X) {
            await drawTree(x + random(PLACE_VAR_MIN, PLACE_VAR_MAX), y + random(PLACE_VAR_MIN, PLACE_VAR_MAX), random(colors));
        }
    }
}

async function drawTree(x, y, color) {
    stroke(color + alpha);
    let trunkHeight = random(MIN_TRUNK_HEIGHT, MAX_TRUNK_HEIGHT);
    line(x, y, x, y - trunkHeight);
    iters = 0;
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
        //await sleep(0.1);
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