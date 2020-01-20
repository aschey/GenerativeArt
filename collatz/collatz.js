/// <reference path="../node_modules/@types/p5/global.d.ts" />

const BACKGROUND = 40;
const FOREGROUND = 200;
const GAUSS_CENTER = 0;
const GAUS_SDT_DEV = 4;
const START_N = 200;
const END_N = 500;
const ALPHA = 'AA';

const fillColors = ['#7DDF64', '#C0DF85', '#DEB986', '#DB6C79', '#ED4D6E'];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(BACKGROUND, );
    for (let y = 10; y < height; y += 10) {
        for (let x = 10; x < width; x += 10) {
            let ax = x + random(-5, 5);
            let ay = y + random(-5, 5);
            let dotColor = 50 + randomGaussian(10, 5);
            if (dotColor > 70) {
                dotColor = 70;
            }
            if (dotColor < 50) {
                dotColor = 50;
            }
            stroke(dotColor);
            point(ax, ay);
            
        }
    }
    
    stroke(FOREGROUND);
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
            let x1 = prevX + gauss();
            let y1 = prevY + gauss();
            let x2 = nextX + gauss();
            let y2 = nextY + gauss();
            line(x1, y1, x2, y2);
            
            prevX = nextX;
            prevY = nextY;
            prev = next;
        }
    }

    for (let y = 10; y < height; y += 50) {
        for (let x = width / 4; x < width; x += 50) {
            let ax = x + random(-25, 25);
            let ay = y + random(-25, 25);
            if (checkPixelColor(ax, ay)) {
                floodFill(ax, ay);
            }
            
        }
    }
}

function checkPixelColor(x, y) {
    let origX = x;
    let origY = y;
    let data = drawingContext.getImageData(x, y, 1, 1);
    if (data.data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        return false;
    }
    while (x > 0 && !data.data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        x--;
        data = drawingContext.getImageData(x, y, 1, 1);
    }
    if (x === 0 || origX - x > 100) {
        return false;
    }
    x++;
    data = drawingContext.getImageData(x, y, 1, 1);
    while (y > 0 && !data.data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        y--;
        data = drawingContext.getImageData(x, y, 1, 1);
    }
    if (y === 0 || origY - y > 100) {
        return false;
    }
    y++;
    data = drawingContext.getImageData(x, y, 1, 1);
    topLeft = {x, y};
    while (x < width && !data.data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        x++;
        data = drawingContext.getImageData(x, y, 1, 1);
    }
    if (x === width || x - topLeft.x > 100) {
        return false;
    }
    x--;
    data = drawingContext.getImageData(x, y, 1, 1);
    while (y < height && !data.data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        y++;
        data = drawingContext.getImageData(x, y, 1, 1);
    }
    if (y === height || y - topLeft.y > 100) {
        return false;
    }
    y--;

    if (x - topLeft.x > 200 || y - topLeft.y > 200 || (x - topLeft.x) / (y - topLeft.y) > 10 || (y - topLeft.y) / (x - topLeft.x) > 10) {
        return false;
    }
    return true;
}

function floodFill(x, y) {
    data = drawingContext.getImageData(x, y, 1, 1);
    if (data.data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        return;
    }
    points = [{x, y}];
    queue = [{x, y}];
    while (queue.length > 0) {
        if (points.length > 10000) {
            return;
        }
        let coord = queue[0];
        queue = queue.slice(1);
        if (!drawingContext.getImageData(coord.x, coord.y + 1, 1, 1).data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x && p.y === coord.y + 1)) {
            queue.push({x: coord.x, y: coord.y + 1});
            points.push({x: coord.x, y: coord.y + 1});
        }
        if (!drawingContext.getImageData(coord.x + 1, coord.y, 1, 1).data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x + 1 && p.y === coord.y)) {
            queue.push({x: coord.x + 1, y: coord.y});
            points.push({x: coord.x + 1, y: coord.y});
        }
        if (!drawingContext.getImageData(coord.x, coord.y - 1, 1, 1).data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x && p.y === coord.y - 1)) {
            queue.push({x: coord.x, y: coord.y - 1});
            points.push({x: coord.x, y: coord.y - 1});
        }
        if (!drawingContext.getImageData(coord.x - 1, coord.y, 1, 1).data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x - 1 && p.y === coord.y)) {
            queue.push({x: coord.x - 1, y: coord.y});
            points.push({x: coord.x - 1, y: coord.y});
        }
    }
    // stroke(BACKGROUND);
    // for (let vPoint of points) {
    //     point(vPoint.x, vPoint.y);
    // }
    stroke(random(fillColors) + ALPHA);
    for (let vPoint of points) {
        point(vPoint.x, vPoint.y);
    }
}

function gauss() {
    return randomGaussian(GAUSS_CENTER, GAUS_SDT_DEV);
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