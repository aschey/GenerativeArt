/// <reference path="node_modules/@types/p5/global.d.ts" />
// taken from https://medium.com/@shvembldr/how-to-make-your-first-generative-art-with-p5-js-3f10afc07de2
const makeLinearGradient = (
  ctx,
  x1,
  y1,
  x2,
  y2,
  colorStops,
  colors,
) => {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  colorStops.forEach((stop, i) => gradient.addColorStop(stop, colors[i]));
  ctx.fillStyle = gradient;
  return gradient;
};

const hexToRgb = hex =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
    )
    .substring(1)
    .match(/.{2}/g)
    .map(x => parseInt(x, 16));

const colors = `#708FA3
#486F88
#29526D
#123852
#032236
#FFC0AA
#D4856A
#AA5639
#803015
#551600
#FFE9AA
#D4B96A
#AA8C39
#806415
#553F00`
  .split('\n')
  .map(hex => hexToRgb(hex));

function element(x, y, borderColors, step) {
  const ctx = drawingContext; // this one is for using native Js canvas features
  const squareSideDotsCount = 30;
  noStroke();

  const squareVertices = [];
  let startAngle = 45;
  for (let i = 0; i < 4; i++) {
    squareVertices.push({
      x: 400 * cos(startAngle),
      y: 400 * sin(startAngle)
    });
    startAngle += 360/4;
  }

  const square = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < squareSideDotsCount; j++) {
      const localx = lerp(
        squareVertices[i].x,
        squareVertices[(i+1) % squareVertices.length].x,
        j / squareSideDotsCount
      );
      const localy = lerp(
        squareVertices[i].y,
        squareVertices[(i + 1) % squareVertices.length].y,
        j / squareSideDotsCount
      );
      square.push({x: localx, y: localy});
    }
  }

  push();
  translate(x, y);  
  for (let i = 0; i < square.length; i++) {
    push();
    noStroke();
    if (i % 2 === 0) {
      fill(borderColors[0]);
    }
    else {
      fill(borderColors[1]);
    }
    beginShape();
    vertex(square[i].x, square[i].y);
    vertex(0, 0);
    vertex(
      square[(i + 1) % square.length].x,
      square[(i + 1) % square.length].y,
    );
    endShape(CLOSE);
    pop();
  }

  const cellCount = 7;
  const innerRectSide = 520;
    
    const grid = [];
    const pointCount = cellCount ** 2;
    const cellSide = innerRectSide / cellCount;
    const startPoint = -(cellSide * (cellCount - 1)) / 2;
    const halfWidth = cellSide / 2;
  if (step > 1) {
    
    for (let rowIndex = 0; rowIndex < cellCount; rowIndex += 1) {
          for (let colIndex = 0; colIndex < cellCount; colIndex += 1) {
              grid.push({
                x: startPoint + colIndex * cellSide,
                y: startPoint + rowIndex * cellSide,
              });
          }
      }
    
    for (let rowIndex = 0; rowIndex < cellCount; rowIndex += 1) {
          for (let colIndex = 0; colIndex < cellCount; colIndex += 1) {
              const x = grid[rowIndex * cellCount + colIndex].x;
              const y = grid[rowIndex * cellCount + colIndex].y;

              if (step > 3) {
                push();
                fill(255);
                rect(x, y, cellSide, cellSide);
                pop();
              }
              else {
                rect(x, y, cellSide, cellSide);
              }

              if (step > 3) {
                if (rowIndex % 2 === 1 && colIndex % 2 === 1) {
                  const r = random(10);
                  
                  push();
                  fill(_.sample(colors));
                  rect(x, y, cellSide, cellSide)
                  pop();
                  
                  if (random(1) > 0.5) {
                    push();
                    fill(_.sample(colors.map(c => `rgba(${c}, 0.4)`)));
                    rect(x + r, y + r, 25, 25);
                    pop();
                  }
                  
                  push();
                  fill(_.sample(colors));
                  rect(x, y, 25, 25);
                  pop();
                  
                  push();
                  fill(_.sample(colors));
                  rect(x, y, 2, 2);
                  pop();
                } else {
                  const r = random(7);
                  noStroke();
                  push();
                  const gradientColors = _.sampleSize(colors.map(c => `rgba(${c}, 0.2)`), 2);
                  makeLinearGradient(
                    ctx,
                    x - halfWidth,
                    y - halfWidth,
                    x + halfWidth,
                    y - halfWidth,
                    [0, 1],
                    gradientColors,
                  )
                  triangle(
                    x - halfWidth,
                    y - halfWidth,
                    x + halfWidth,
                    y - halfWidth,
                    x + halfWidth,
                    y + halfWidth,
                  );
                  pop();
                  
                  push();
                  fill(_.sample(colors.map(c => `rgba(${c}, 0.1)`)));
                  triangle(
                    x - halfWidth,
                    y - halfWidth,
                    x - halfWidth,
                    y + halfWidth,
                    x + halfWidth,
                    y + halfWidth,
                  );
                  pop();
                  
                  
                  if (random(1) > 0.6) {
                    push();
                    strokeWeight(2);
                    stroke(_.sample(colors));
                    line(x - halfWidth, y, x + halfWidth, y);
                    pop();
                  }
                  
                  if (random(1) > 0.7) {
                    push();
                    strokeWeight(2);
                    stroke(_.sample(colors));
                    line(x, y - halfWidth, x, y + halfWidth);
                    pop();
                  }
                  
                  if (random(1) > 0.8) {
                    push();
                    fill(_.sample(colors));
                    circle(x, y, 30);
                    pop();
                  }
                  
                  if (random(1) > 0.4) {
                    push();
                    fill(_.sample(colors));
                    circle(x, y, 3);
                    pop();
                    
                    if (random(1) > 0.3) {
                      push();
                      fill(_.sample(colors.map(c => `rgba(${c}, 0.3)`)));
                      circle(x + r, y + r, 5);
                      pop();
                    }
                  }
                }
              }
          }
    }
  }

  if (step > 2 && step < 4) {
    for (let rowIndex = 0; rowIndex < cellCount; rowIndex += 1) {
      for (let colIndex = 0; colIndex < cellCount; colIndex += 1) {
          const x = grid[rowIndex * cellCount + colIndex].x;
          const y = grid[rowIndex * cellCount + colIndex].y;
          const halfWidth = cellSide / 2;
        
        if (rowIndex % 2 === 1 && colIndex % 2 === 1) {
          push();
          fill(_.sample(colors));
          rect(x, y, cellSide, cellSide)
          pop();
          
          push();
          fill(_.sample(colors.map(c => `rgba(${c}, 0.4)`)));
          rect(x + 5, y + 5, 25, 25);
          pop();
          
          push();
          fill(_.sample(colors));
          rect(x, y, 25, 25);
          pop();
          
          push();
          fill(_.sample(colors));
          rect(x, y, 2, 2);
          pop();
        } else {
          noStroke();
          push();
          const gradientColors = _.sampleSize(colors.map(c => `rgba(${c}, 0.6)`), 2);
          makeLinearGradient(
            ctx,
            x - halfWidth,
            y - halfWidth,
            x + halfWidth,
            y - halfWidth,
            [0, 1],
            gradientColors,
          )
          triangle(
            x - halfWidth,
            y - halfWidth,
            x + halfWidth,
            y - halfWidth,
            x + halfWidth,
            y + halfWidth,
          );
          pop();
          
          push();
          fill(_.sample(colors));
          triangle(
            x - halfWidth,
            y - halfWidth,
            x - halfWidth,
            y + halfWidth,
            x + halfWidth,
            y + halfWidth,
          );
          pop();
          
          push();
          fill(_.sample(colors));
          circle(x, y, 30);
          pop();
          
          push();
          fill(_.sample(colors.map(c => `rgba(${c}, 0.4)`)));
          circle(x + 5, y + 5, 5);
          pop();
          
          push();
          fill(_.sample(colors));
          circle(x, y, 3);
          pop();
          
          push();
          strokeWeight(2);
          stroke(_.sample(colors));
          line(x - halfWidth, y, x + halfWidth, y);
          pop();
          
          push();
          strokeWeight(2);
          stroke(_.sample(colors));
          line(x, y - halfWidth, x, y + halfWidth);
          pop();
        }
      }  
    }
  }
  pop();
}

function setup() {
  const step = 4;
  createCanvas(windowWidth, windowHeight); // canvas
  angleMode(DEGREES); // lets use degrees instead of radians
  rectMode(CENTER); // lets our rectangles starts from center
  x = width / 2; // x coordinate of center of canvas
  y = height / 2; // y coordinate of center of canvas
  if (step > 3) {
    rotate(45);
    generate(x, y, step);
  }
  else {
    const borderColors = _.sampleSize(colors, 2);
    element(x, y, borderColors, step);
  }
}

const generate = (x, y, step) => {
  translate(x, y);
  const borderColors = _.sampleSize(colors, 2);
  const cellCount = 6;
  const cellSide = 560;
  const startPoint = -(cellSide * (cellCount - 1)) / 2;
  for (let rowIndex = 0; rowIndex < cellCount; rowIndex += 1) {
        for (let colIndex = 0; colIndex < cellCount; colIndex += 1) {
          x = startPoint + colIndex * cellSide;
          y = startPoint + rowIndex * cellSide;
          
          element(x, y, borderColors, step);
        }
    }
  
}