/// <reference path="../node_modules/@types/p5/global.d.ts" />

const START_N = 1;
const END_N = 1011;
const SPACING = 0.5;
const DELTA = 5;

function setup() {
    createCanvas(windowWidth, 1000);
    //stroke('#FF0000');
    // for (let y = 0; y < height; y += SPACING) {
    //     for (let x = 0; x < width; x += SPACING) {
    //         point(x, y);
    //     }
    // }
    angleMode(DEGREES);
    noLoop();
}

async function draw() {
    translate(width / 2, height / 2);
    let startX = 0;
    let startY = 0;
    for (let res of doCollatz()) {
        let xDelta = 0;
        let yDelta = 0;
        stroke(randomGaussian(75, 10));
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
        line(
            res.prevY * SPACING + DELTA + yDelta + startY, 
            res.prevX * SPACING + DELTA + xDelta + startX, 
            res.nextY * SPACING + DELTA + yDelta + startY,
            res.nextX * SPACING + DELTA + xDelta + startX, 
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

function* doCollatz() {
    for (let i = START_N; i < END_N; i++) {
        let prevR = i;
        let prevTheta = i;
        let prev = i;
        
        for (let next of genCollatz(i)) {
            let nextR = prevR;
            let nextTheta = prevTheta;
            if (prev % 2 == 0) {
                //nextR = (width / 2) / next; 
                nextR = next;
            }
            else {
                nextTheta = 360 / next;//atan(next);//cos(next * PI / 180);
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