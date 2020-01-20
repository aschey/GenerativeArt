/// <reference path="../node_modules/@types/p5/global.d.ts" />

const BACKGROUND = 40;
const FOREGROUND = '#4C6663';
const GAUSS_CENTER = 0;
const GAUS_SDT_DEV = 4;
const START_N = 200;
const END_N = 500;
const ALPHA = 'AA';

//const fillColors = ['#7DDF64', '#C0DF85', '#DEB986', '#DB6C79', '#ED4D6E'];
//const fillColors = ['#A7E2E3', '#80CFA9', '#4C6663', '#7392B7', '#FFA69E']
//const fillColors = ['#C1EDCC', '#62BFED', '#A7E2E3', '#80CFA9', '#B0C0BC']
const fillColors = ['#38023B', '#62BFED', '#A7E2E3', '#80CFA9', '#A288E3']

function setup() {
    createCanvas(3500, 1200);
    noSmooth();
    background(BACKGROUND);
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
    
    //stroke(FOREGROUND);
    noLoop();
}
function draw() {
    for (let i = START_N; i < END_N; i++) {
        let prevX = i;
        let prevY = i;
        let prev = i;
        stroke(colorGradient('#4C6663', '#A7E2E3', noise(i * 0.02, i * 0.02)));
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
    loadPixels();
    noStroke();
    for (let y = 50; y < height; y += 50) {
        for (let x = round(width / 4); x < width; x += 50) {
            let ax = x + round(random(-25, 25));
            let ay = y + round(random(-25, 25));
            if (checkPixelColor(ax, ay)) {
                floodFill(ax, ay);
            }
            
        }
    }
}

function checkPixelColor(x, y) {
    let origX = x;
    let origY = y;
    let data = getPixel(x, y, 1, 1);
    if (data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        return false;
    }
    while (x > 0 && !data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        x--;
        data = getPixel(x, y, 1, 1);
    }
    if (x === 0 || origX - x > 100) {
        return false;
    }
    x++;
    data = getPixel(x, y, 1, 1);
    while (y > 0 && !data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        y--;
        data = getPixel(x, y, 1, 1);
    }
    if (y === 0 || origY - y > 100) {
        return false;
    }
    y++;
    data = getPixel(x, y, 1, 1);
    topLeft = {x, y};
    while (x < width && !data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        x++;
        data = getPixel(x, y, 1, 1);
    }
    if (x === width || x - topLeft.x > 100) {
        return false;
    }
    x--;
    data = getPixel(x, y, 1, 1);
    while (y < height && !data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        y++;
        data = getPixel(x, y, 1, 1);
    }
    if (y === height || y - topLeft.y > 100) {
        return false;
    }
    y--;

    if (x - topLeft.x > 200 || y - topLeft.y > 200 || (x - topLeft.x) / (y - topLeft.y) > 10 || (y - topLeft.y) / (x - topLeft.x) > 10) {
        return false;
    }
    for (let curX = topLeft.x; curX < x; curX++) {
        for (let curY = topLeft.y; curY < y; curY++) {
            data = getPixel(curX, curY, 1, 1);
            if (data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
                return false;
            }
        }
    }
    return true;
}

function floodFill(x, y) {
    data = getPixel(x, y, 1, 1);
    if (data.some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))) {
        return;
    }
    points = [{x, y}];
    queue = [{x, y}];
    let minX = x;
    let minY = y;
    let maxX = x;
    let maxY = y;
    while (queue.length > 0) {
        if (points.length > 10000) {
            return;
        }
        let coord = queue[0];
        queue = queue.slice(1);
        if (!getPixel(coord.x, coord.y + 1, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x && p.y === coord.y + 1)) {
            maxY = max(maxY, coord.y + 1);
            queue.push({x: coord.x, y: coord.y + 1});
            points.push({x: coord.x, y: coord.y + 1});
        }
        // else if (getPixel(coord.x, coord.y + 1, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))){
        //     console.log(getPixel(coord.x, coord.y + 1, 1, 1))
        // }
        if (!getPixel(coord.x + 1, coord.y, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x + 1 && p.y === coord.y)) {
            maxX = max(maxX, coord.x + 1);
            queue.push({x: coord.x + 1, y: coord.y});
            points.push({x: coord.x + 1, y: coord.y});
        }
        // else if (getPixel(coord.x + 1, coord.y, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))){
        //     console.log(getPixel(coord.x + 1, coord.y, 1, 1))
        // }
        if (!getPixel(coord.x, coord.y - 1, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x && p.y === coord.y - 1)) {
            minY = min(minY, coord.y - 1);
            queue.push({x: coord.x, y: coord.y - 1});
            points.push({x: coord.x, y: coord.y - 1});
        }
        // else if (getPixel(coord.x, coord.y - 1, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))){
        //     console.log(getPixel(coord.x, coord.y - 1, 1, 1))
        // }
        if (!getPixel(coord.x - 1, coord.y, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70)) && !points.some(p => p.x === coord.x - 1 && p.y === coord.y)) {
            minX = min(minX, coord.x - 1);
            queue.push({x: coord.x - 1, y: coord.y});
            points.push({x: coord.x - 1, y: coord.y});
        }
        // else if (getPixel(coord.x - 1, coord.y, 1, 1).some(d => d !== 255 && d !== BACKGROUND && (d < 50 || d > 70))){
        //     console.log(getPixel(coord.x - 1, coord.y, 1, 1))
        // }
    }
    // stroke(BACKGROUND);
    // for (let vPoint of points) {
    //     point(vPoint.x, vPoint.y);
    // }
    // https://en.wikipedia.org/wiki/Graham_scan
    let minXatMinY = maxX;
    let maxXatMinY = minX;
    let minXatMaxY = maxX;
    let maxXatMaxY = minX;
    let minYatMinX = maxY;
    let maxYatMinX = minY;
    let minYatMaxX = maxY;
    let maxYatMaxX = minY;
    for (let vPoint of points) {
        if (vPoint.y === minY) {
            minXatMinY = min(minXatMinY, vPoint.x);
            maxXatMinY = max(maxXatMinY, vPoint.x);
        }
        if (vPoint.y === maxY) {
            minXatMinY = min(minXatMaxY, vPoint.x);
            maxXatMaxY = max(maxXatMaxY, vPoint.x);
        }
        if (vPoint.x == minX) {
            minYatMinX = min(minYatMinX, vPoint.y);
            maxYatMinX = max(maxYatMinX, vPoint.y);
        }
        if (vPoint.y == maxX) {
            minYatMaxX = min(minYatMaxX, vPoint.y);
            maxYatMaxX = max(maxYatMaxX, vPoint.y);
        }
    }
    fill(random(fillColors) + ALPHA);
    // let x1 = minXatMinY;
    // let y1 = minY;
    // let x2 = minXatMinY === maxXatMinY ? null : maxXatMinY;
    // let y2 = minXatMinY === maxXatMinY ? null : minY;
    // let x3 =
    quad(minXatMinY, minYatMinX, maxXatMinY, minYatMaxX, maxXatMaxY, maxYatMaxX, minXatMaxY, maxYatMinX);
    // for (let vPoint of points) {
    //     point(vPoint.x, vPoint.y);
    // }
    //loadPixels();
}

function getPixel(x, y) {
    let d = pixelDensity();
    index = round(4 * ((y * d) * width * d + (x * d )));
    return [pixels[index], pixels[index + 1], pixels[index + 2]];
}

function gauss() {
    return round(randomGaussian(GAUSS_CENTER, GAUS_SDT_DEV));
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