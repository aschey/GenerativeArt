/// <reference path="node_modules/@types/p5/global.d.ts" />

const BACKGROUND = 40;
const FOREGROUND = 200;
const GAUSS_CENTER = 0;
const GAUS_SDT_DEV = 4;
const START_N = 200;
const END_N = 500;
function setup() {
    createCanvas(windowWidth, windowHeight);

    background(40);
    stroke(200);
    noLoop();
}
async function draw() {
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
            line(prevX + gauss(next), prevY + gauss(next), nextX + gauss(next), nextY + gauss(next));
            
            prevX = nextX;
            prevY = nextY;
            prev = next;
        }

    }
}

function gauss(i) {
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