/// <reference path="../util/util.js" />
/// <reference path="./consts.js" />
/// <reference path="../thirdParty/pixi.min.js" />

let width = 0;
let height = 0;

let leftX;
let rightX;
let topY;
let bottomY;
let resolution;
let stepLength;
let numCols;
let numRows;
let manager;

document.addEventListener('DOMContentLoaded', async () => {
  manager = new AppManager();
  width = 1000;
  height = 800;
  manager.app.renderer.backgroundColor = getColorInt('#FFFFFF');

  leftX = Math.round(width * 0);
  rightX = Math.round(width * 1);
  topY = Math.round(height * 0);
  bottomY = Math.round(height * 1);
  resolution = Math.round(width * 0.01);
  stepLength = width * 0.0001;
  numCols = Math.round((rightX - leftX) / resolution);
  numRows = Math.round((bottomY - topY) / resolution);

  await draw();
});

const draw = async () => {
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
      let x = col * resolution + leftX;
      let y = row * resolution + topY;
      let angle = getAngle(col, row);
      grid[col][row] = angle;
      manager.exec(g => {
        g.lineStyle(1, getColorInt('#000000'));
        g.moveTo(x, y);
        g.lineTo(x + 10 * Math.cos(angle), y + 10 * Math.sin(angle));
      });
      let res = polarToCartesian(resolution / 2, angle);
      //circle(x, y, 2);
      //line(x, y, x + res.x, y + res.y);
    }
  }
  //manager.append();
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

  //drawLine(900, 900, grid);

  for (let y = 0; y < height; y += 5) {
    for (let x = 0; x < width; x += 5) {
      //console.log(x, y);
      drawLine(x + equiRandom(5), y + equiRandom(5), grid);
    }
    await sleep(1);
  }

  manager.append();
};

const drawLine = (x, y, grid) => {
  let numSteps = 100;
  let points = [];
  for (let n = 0; n < numSteps; n++) {
    //try {
    //console.log(x, y);
    points.push([x + perlin(x * 0.005, y * 0.005, 4, 0.002), y + perlin(x * 0.005, y * 0.005, 4, 0.002)]);
    let xOffset = x - leftX;
    let yOffset = y - topY;
    let colIndex = Math.round(xOffset / resolution);
    let rowIndex = Math.round(yOffset / resolution);
    if (colIndex >= 0 && grid.length > colIndex && grid[colIndex].length > rowIndex && rowIndex >= 0) {
      let gridAngle = grid[colIndex][rowIndex];

      //let gridAngle = getAngle(colIndex, rowIndex);//grid[colIndex][rowIndex];
      let xStep = stepLength * Math.cos(gridAngle);
      let yStep = stepLength * Math.sin(gridAngle);
      x += xStep;
      y += yStep;
    }

    //}
    //catch (e){
    //    console.log(e);
    //}
  }
  // manager.exec(g => {
  //   drawCurve2(points);
  //   g.endFill();
  // });
  drawCurve2(points);
  //manager.append();
};
let prevTheta = 0;

const drawCurve2 = points => {
  if (points.length < 3) return;

  const controls = calcControlPoints(points);

  manager.exec(g => {
    g.beginFill();
    g.lineStyle(1, getColorInt('#000000'));
    g.moveTo(controls[0][0], controls[0][1]);
  });
  controls.slice(1).forEach(p => manager.exec(g => g.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5])));
  manager.exec(g => g.endFill());
  //manager.append();
  // controls.slice(1).forEach(p => manager.exec(g => g.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5])));
  // manager.exec(g => g.endFill());
};

function getAngle(colIndex, rowIndex) {
  //return (rowIndex / numRows) * Math.PI;
  let centerCol = Math.round(numCols / 2);
  let centerRow = Math.round(numRows / 2);
  //let theta = createVector((rowIndex - centerRow) / numRows, (colIndex - centerCol) / numCols).angleBetween(createVector(centerRow, centerCol));
  //let theta = createVector((colIndex - centerCol), (rowIndex - centerRow)).angleBetween(createVector(centerCol, centerRow));
  // let theta = angleBetweenPoints(
  //   (rowIndex - centerRow) / numRows,
  //   (colIndex - centerCol) / numCols,
  //   centerRow,
  //   centerCol
  // );
  let theta = angleBetweenPoints(rowIndex, colIndex, centerRow, centerCol);
  let r = distance(colIndex, rowIndex, centerCol, centerRow);
  // if (theta < 0) {
  //     prevTheta = theta;
  // }
  // if (theta > 0) {
  //     console.log(prevTheta, theta);
  // }

  //return Math.PI / 2 - theta + perlin(rowIndex * 0.005, colIndex * 0.005, 4, 0.02);
  //return ((abs(rowIndex - centerRow) / centerRow) + (abs(colIndex - centerCol) / centerCol)) * PI;//(colIndex - centerCol) * PI;
  //console.log(theta, r);
  return theta + Math.PI * r;
}

// let theta = angleBetweenPoints(rowIndex, colIndex, centerRow, centerCol);
//  let r = distance(colIndex, rowIndex, centerCol, centerRow);
// return theta + Math.PI * r;
