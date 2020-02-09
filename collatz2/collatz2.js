/// <reference path="../node_modules/@types/p5/global.d.ts" />

const START_N = 1;
const END_N = 1011;
const SPACING = 0.5;
const DELTA = 5;
const scribble = new Scribble();
const BASE_H = 15;
const BASE_S = 10;
const BASE_B = 100;

function setup() {
    let density = 30000;
    createCanvas(windowWidth, 1200);
    frameRate(5);
    colorMode(HSB, 100);
    // background(BASE_H, BASE_S, BASE_B)
    // for(let i = 0; i < density; i++) {
    //     stroke(
    //       BASE_H,
    //       BASE_S - Math.random() * 5,
    //       BASE_B - Math.random() * 8,
    //       Math.random() * 10 + 75
    //     );
    
    //     let x1 = Math.random() * width;
    //     let y1 = Math.random() * height;
    //     let theta = Math.random() * 2 * Math.PI;
    //     let segmentLength = Math.random() * 5 + 2;
    //     let x2 = Math.cos(theta) * segmentLength + x1;
    //     let y2 = Math.sin(theta) * segmentLength + y1;
    
    //     line(x1, y1, x2, y2);
    //   }
    colorMode(RGB);
    angleMode(DEGREES);
    noLoop();
}

async function draw() {
    translate(500, 500);
    let startX = 0;
    let startY = 0;
    //let fr = r => r;
    //let ftheta = theta => 360/theta;
    //let fr = r => acos(r);
    //let ftheta = theta => cos(theta);
    //let fr = r => tan(r);
    //let ftheta = theta => theta;
    //let fr = r => sin(r)*asin(r);
    //let ftheta = theta => theta;
    //let fr = r => r;
    //let ftheta = theta => asin(theta);
    drawShape(r => acos(r), theta => cos(theta), 0, 0);
    drawShape(r => r, theta => asin(theta), 0, width / 3);
    drawShape(r => sin(r)*asin(r), theta => theta, 0, 2 * width / 3);
}

function drawShape(fr, ftheta, startX, startY) {
    for (let res of doCollatz(fr, ftheta)) {
        let xDelta = 0;
        let yDelta = 0;
        stroke(randomGaussian(50, 10));
        if (res.prevX === res.nextX) {
            if (res.prevY < res.nextY) {
                //stroke(50);
                xDelta = -SPACING/4;
            }
            else {
                //stroke(100);
                xDelta = SPACING/4;
            }
        }
        else {
            if (res.prevX < res.nextX) {
                //stroke(50);
                yDelta = -SPACING/4;
            }
            else {
                //stroke(100);
                yDelta = SPACING/4;
            }
        }
        // if (res.prevX === res.nextX) {
        //     continue;
        // }
        let noiseC = 4;
        // if (res.prevX > height) {
        //     res.prevX = randomGaussian(height + 125, 10);
        // }
        // if (res.nextX > height) {
        //     res.nextX = randomGaussian(height + 125, 10);
        // }
        scribble.scribbleLine(
            res.prevY * SPACING + DELTA + yDelta + startY + noiseC, //* noise(res.prevX, res.prevY), 
            res.prevX * SPACING + DELTA + xDelta + startX + noiseC, //* noise(res.prevX, res.prevY), 
            res.nextY * SPACING + DELTA + yDelta + startY + noiseC, //* noise(res.nextX, res.nextY),
            res.nextX * SPACING + DELTA + xDelta + startX + noiseC //* noise(res.nextX, res.nextY), 
            );
        //square(res.prevX * SPACING + DELTA - SPACING/4, res.prevY * SPACING + DELTA - SPACING/4, SPACING/2);
        //square(res.nextX * SPACING + DELTA - SPACING/4, res.nextY * SPACING + DELTA - SPACING/4, SPACING/2);
        //await sleep(100);
        if (res.current === 1) {
            
            //clear();
            //startX += 50;
            // if (startX >= width) {
            //     startX = 0;
            //     startY += 50;
            // }
        }
    }
}
function* doCollatz(fr, ftheta) {
    for (let i = START_N; i < END_N; i++) {
        let prevR = i;
        let prevTheta = i;
        let prev = i;
        
        for (let next of genCollatz(i)) {
            let nextR = prevR;
            let nextTheta = prevTheta;
            if (prev % 2 == 0) {
                //nextR = (width / 2) / next; 
                nextR = fr(next);
            }
            else {
                nextTheta = ftheta(next);//atan(next);//cos(next * PI / 180);
            }
            
            yield {
                prevX: prevR * cos(prevTheta), 
                prevY: prevR * sin(prevTheta), 
                nextX: nextR * cos(nextTheta), 
                nextY: nextR * sin(nextTheta), val: i, current: next};

            prevR = nextR;
            prevTheta = nextTheta;
            prev = next;
        }
    }
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