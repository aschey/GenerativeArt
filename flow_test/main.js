var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  width = (canvas.width = window.innerWidth),
  height = (canvas.height = window.innerHeight);
leftX = Math.round(width * 0);
rightX = Math.round(width * 1);
topY = Math.round(height * 0);
bottomY = Math.round(height * 1);
resolution = Math.round(width * 0.01);
stepLength = width * 0.0001;
numCols = Math.round((rightX - leftX) / resolution);
numRows = Math.round((bottomY - topY) / resolution);

var count = 5000000;
context.lineWidth = 0.25;
let invoked = 0;

const polarToCartesian = (r, theta) => ({ x: r * Math.cos(theta), y: r * Math.sin(theta) });

function angleBetweenPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

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

function calcControlPoints(points) {
  const n = points.length;

  // Abort if there are not sufficient points to draw a curve
  if (n < 3) return points;

  let p0 = points[0];
  let p1 = points[0];
  let p2 = points[1];
  let p3 = points[2];
  let pts = [points[0]];

  for (let i = 1; i < n; i++) {
    pts.push([
      (-p0[0] + 6 * p1[0] + p2[0]) / 6,
      (-p0[1] + 6 * p1[1] + p2[1]) / 6,
      (p1[0] + 6 * p2[0] - p3[0]) / 6,
      (p1[1] + 6 * p2[1] - p3[1]) / 6,
      p2[0],
      p2[1],
    ]);

    p0 = p1;
    p1 = p2;
    p2 = p3;
    p3 = points[i + 2] || p3;
  }

  return pts;
}

const drawCurve2 = points => {
  if (points.length < 3) return;

  const controls = calcControlPoints(points);
  context.beginPath();
  context.moveTo(controls[0][0], controls[0][1]);
  controls.slice(1).forEach(p => context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]));
  invoked++;
  //context.lineTo(controls[1][0], controls[1][1]);
  context.stroke();
  //manager.exec(g => g.endFill());
  //manager.append();
  // controls.slice(1).forEach(p => manager.exec(g => g.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5])));
  // manager.exec(g => g.endFill());
};

function equiRandom(val) {
  return random(-val, val);
}

function random(args) {
  if (!arguments || arguments.length === 0) {
    return Math.random();
  }
  if (arguments.length === 1) {
    let val = arguments[0];
    if (typeof val === 'number') {
      return Math.random() * val;
    }
    return val[Math.floor(Math.random() * val.length)];
  }
  if (arguments.length === 2) {
    let min = arguments[0];
    let max = arguments[1];
    return Math.random() * (max - min) + min;
  }
}

function perlin(x, y, octaves, persistence) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  for (var i = 0; i < octaves; i++) {
    total += 0.5 * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }
  return (total / maxValue + 1) * 0.5;
}

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
    //g.lineStyle(1, getColorInt('#000000'));
    context.moveTo(x, y);
    context.lineTo(x + 10 * Math.cos(angle), y + 10 * Math.sin(angle));
    context.stroke();
    let res = polarToCartesian(resolution / 2, angle);
    //circle(x, y, 2);
    //line(x, y, x + res.x, y + res.y);
  }
}

for (let y = 0; y < height; y += 5) {
  for (let x = 0; x < width; x += 5) {
    //console.log(x, y);
    drawLine(x + equiRandom(5), y + equiRandom(5), grid);
  }
  //await sleep(1);
}
console.log(invoked);

// for (var i = 0; i < count; i++) {
//   var x = Math.random() * width,
//     y = Math.random() * height;

//   var value = getValue(x, y);

//   context.save();
//   context.translate(x, y);

//   render(value);

//   context.restore();
// }

function getValue(x, y) {
  return (Math.sin(x * 0.01) + Math.sin(y * 0.01)) * Math.PI * 2;
}

function render(value) {
  context.rotate(value);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(Math.random() * 1 + 1, 1);
  context.stroke();
}
