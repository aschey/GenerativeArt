/// <reference path="node_modules/@types/p5/global.d.ts" />

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
}

function draw() {
    colors = ['#177E89', '#084C61', '#DB3A34', '#FFC857', '#584D3D']
    for (let y = 50; y < height; y += 50) {
        for (let x = 50; x < width; x += 50) {
            drawTree(x + random(-10, 20), y + random(-10, 20), random(colors));
        }
    }
}

function drawTree(x, y, color) {
    MAX_X = 10
    MIN_Y = 50
    DELTA_SLOPE = 0.1;
    DIST_THRESH = 0.5;
    stroke(color);
    line(x, y, x, y - 30);

    lines = [{x1: x, y1: y, x2: x, y2: y - 30}];

    while (lines.length < 20) {
        // get a point on the line y = mx + b
        let curLine = random(lines);
        let slope = getSlope(curLine.x1, curLine.y1, curLine.x2, curLine.y2);
        let intercept = curLine.y1 - (slope * curLine.x1);
        let x1 = random(curLine.x1, curLine.x2);
        let y1 = (slope === Infinity || slope === -Infinity) ? random(curLine.y1, curLine.y2) : slope * x1 + intercept;
        let x2 = x1 + random(-15, 15);
        let y2 = y1 + random(-15, 0);

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