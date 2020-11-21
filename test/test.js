let leftX;
let rightX;
let topY;
let bottomY;
let resolution;
let stepLength;
let numCols;
let numRows;

function setup() {
    createCanvas(windowWidth, windowHeight);

     leftX = round(width * 0);
     rightX = round(width * 1);
     topY = round(height * 0);
     bottomY = round(height * 1);
     resolution = round(width * 0.01);
     stepLength = width * 0.0001;
    numCols = round((rightX - leftX) / resolution);
    numRows = round((bottomY - topY) / resolution);
    noLoop();
}

function draw() {
    //translate(width / 2, height / 2);
    let grid = [];
    for (let col = 0; col < numCols; col++) {
        grid.push([]);
        for (let row = 0; row < numRows; row++) {
            grid[col].push(0);
        }
    }
    for (let col = 0; col < numCols; col++) {
        for (let row = 0; row < numRows; row++) {
            let x = (col * resolution) + leftX;
            let y = (row * resolution) + topY;
            let angle = getAngle(col, row);
            grid[col][row] = angle;
            let res = polarToCartesian(resolution / 2, angle);
            //circle(x, y, 2);
            //line(x, y, x + res.x, y + res.y);
        }
    }
    // for (let col = 0; col < numCols / 2; col++) {
    //     for (let row = 0; row < numRows / 2; row++) {
    //         let x = (col * resolution) + leftX;
    //         let y = (row * resolution) + topY;
    //         let angle = getAngle(row, col);
    //         grid[col][row] = angle;
    //         let res = polarToCartesian(resolution / 2, angle);
    //         circle(x, y, 2);
    //         line(x, y, x + res.x, y + res.y);
    //     }
    // }
    //translate(0, height / 2);
    //rotate(PI);
    // for (let col = 0; col < numCols; col++) {
    //     for (let row = numRows / 2; row < numRows; row++) {
    //         let x = (col * resolution) + leftX;
    //         let y = (row * resolution) + topY;
    //         let angle = getAngle(numRows - row, numCols - col);
    //         grid[col][row + round(numRows / 2)] = angle;
    //         let res = polarToCartesian(resolution / 2, angle);
    //         circle(x, y, 2);
    //         line(x, y, x + res.x, y + res.y);
    //     }
    // }
    

    for (let y = 100; y < height; y += 100) {
        for (let x = 100; x < width; x += 100) {
            drawLine(x + equiRandom(50), y + equiRandom(50), grid);
        }
        
    }
    
}

function drawLine(x, y, grid) {
    let numSteps = 10000;
    noFill();
    beginShape();
    for (let n = 0; n < numSteps; n++) {
        try {
            //console.log(x, y);
            curveVertex(x + noise(x * 0.005, y * 0.005), y + noise(x * 0.005, y * 0.005));
            let xOffset = x - leftX;
            let yOffset = y - topY;
            let colIndex = round(xOffset / resolution);
            let rowIndex = round(yOffset / resolution);
            let gridAngle = grid[colIndex][rowIndex];
            //let gridAngle = getAngle(colIndex, rowIndex);//grid[colIndex][rowIndex];
            let xStep = stepLength * cos(gridAngle);
            let yStep = stepLength * sin(gridAngle);
            x += xStep;
            y += yStep;
        }
        catch {
            
        }
        
    }
    endShape();
}
let prevTheta = 0;

function getAngle(colIndex, rowIndex) {
    let centerCol = round(numCols / 2);
    let centerRow = round(numRows / 2);
    //let theta = createVector((rowIndex - centerRow) / numRows, (colIndex - centerCol) / numCols).angleBetween(createVector(centerRow, centerCol));
    let theta = createVector((colIndex - centerCol), (rowIndex - centerRow)).angleBetween(createVector(centerCol, centerRow));
    let r = distance((colIndex - centerCol), (rowIndex - centerRow), centerCol, centerRow);
    // if (theta < 0) {
    //     prevTheta = theta;
    // }
    // if (theta > 0) {
    //     console.log(prevTheta, theta);
    // }
    
    return (PI / 2 - theta)+ noise(rowIndex * 0.005, colIndex * 0.005);
    //return ((abs(rowIndex - centerRow) / centerRow) + (abs(colIndex - centerCol) / centerCol)) * PI;//(colIndex - centerCol) * PI;
    //return (rowIndex * PI * noise(rowIndex * 0.05, colIndex * 0.05)) / numRows;
}