/// <reference path="node_modules/@types/p5/global.d.ts" />

const MAX_X = 10;
const MIN_Y = 50;
const X_VAR = 15;
const Y_VAR = 15;
const PLACE_VAR_MIN = -10;
const PLACE_VAR_MAX = 20;
const TRUNK_HEIGHT = 30;
const NUM_BRANCHES = 20;
const START_X = 50;
const START_Y = 50;
const DELTA_SLOPE = 0.1;
const DIST_THRESH = 0.5;

const bgColor = '#101C23'
const colors = ['#743A15', '#735C20', '#4A583B', '#2D473F', '#393E41']

function setup() {
    createCanvas(windowWidth, windowHeight);
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
    stroke(color);
    line(x, y, x, y - TRUNK_HEIGHT);

    lines = [{x1: x, y1: y, x2: x, y2: y - TRUNK_HEIGHT}];

    while (lines.length < NUM_BRANCHES) {
        // get a point on the line y = mx + b
        let curLine = random(lines);
        let slope = getSlope(curLine.x1, curLine.y1, curLine.x2, curLine.y2);
        let intercept = curLine.y1 - (slope * curLine.x1);
        let x1 = random(curLine.x1, curLine.x2);
        let y1 = (slope === Infinity || slope === -Infinity) ? random(curLine.y1, curLine.y2) : slope * x1 + intercept;
        let x2 = x1 + random(-X_VAR, X_VAR);
        let y2 = y1 + random(-Y_VAR, 0);

        if (x1 > x + MAX_X || x1 < x - MAX_X || y2 < y - MIN_Y) {
            continue;
        }
        tooSimilar = false;
        let curSlope = getSlope(x1, y1, x2, y2);
        for (prevLine of lines) {
            prevSlope = getSlope(prevLine.x1, prevLine.y1, prevLine.x2, prevLine.y2);

            // Don't allow any lines to intersect, any two slopes to be too similar, or any two end points to be too close
            if (intersects(x1, y1, x2, y2, prevLine.x1, prevLine.y1, prevLine.x2, prevLine.y2) || 
                prevSlope - DELTA_SLOPE <= curSlope && curSlope <= prevSlope + DELTA_SLOPE ||
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

function intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } 
    else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
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