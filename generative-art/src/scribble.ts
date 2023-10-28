// Lightly modified from https://github.com/generative-light/p5.scribble.js/ to work with pixi.js

import { drawCurve, random } from "./util";
import * as PIXI from "pixi.js";

/*
This file contains functions for drawing 2d primitives with a handy sketchy look in p5.js.

Author: Janneck Wullschleger in 07/2016
Web: http://itsjw.de
Mail: jw@itsjw.de

Updated: 24.02.2017 to use with a reference to the p5 instance.
Just put it in as param to the constructor.

Much of the source code is taken from the handy library for processing,
written by Jo Wood, giCentre, City University London based on an idea by Nikolaus Gradwohl.
The handy library is licensed under the GNU Lesser General Public License: http://www.gnu.org/licenses/.
*/

export class Scribble {
  bowing: number;
  roughness: number;
  maxOffset: number;
  numEllipseSteps: number;
  ellipseInc: number;
  constructor() {
    this.bowing = 1;
    this.roughness = 1;
    this.maxOffset = 2;
    this.numEllipseSteps = 9;
    this.ellipseInc = (Math.PI * 2) / this.numEllipseSteps;
  }

  getOffset(minVal: number, maxVal: number) {
    return this.roughness * (random() * (maxVal - minVal) + minVal);
  }

  //   buildEllipse  (cx:number, cy:number, rx:number, ry:number, offset:number, overlap:number, g: PIXI.Graphics) {
  //     var radialOffset = this.getOffset(-0.5, 0.5) - Math.PI / 2;

  //     let points = [
  //       this.getOffset(-offset, offset) +
  //         cx +
  //         0.9 * rx * Math.cos(radialOffset - this.ellipseInc),
  //       this.getOffset(-offset, offset) +
  //         cy +
  //         0.9 * ry * Math.sin(radialOffset - this.ellipseInc),
  //     ];

  //     for (
  //       var theta = radialOffset;
  //       theta < Math.PI * 2 + radialOffset - 0.01;
  //       theta += this.ellipseInc
  //     ) {
  //       points.push(this.getOffset(-offset, offset) + cx + rx * Math.cos(theta));
  //       points.push(this.getOffset(-offset, offset) + cy + ry * Math.sin(theta));
  //     }

  //     points.push(
  //       this.getOffset(-offset, offset) +
  //         cx +
  //         rx * Math.cos(radialOffset + Math.PI * 2 + overlap * 0.5)
  //     );
  //     points.push(
  //       this.getOffset(-offset, offset) +
  //         cy +
  //         ry * Math.sin(radialOffset + Math.PI * 2 + overlap * 0.5)
  //     );
  //     points.push(
  //       this.getOffset(-offset, offset) +
  //         cx +
  //         0.98 * rx * Math.cos(radialOffset + overlap)
  //     );
  //     points.push(
  //       this.getOffset(-offset, offset) +
  //         cy +
  //         0.98 * ry * Math.sin(radialOffset + overlap)
  //     );
  //     points.push(
  //       this.getOffset(-offset, offset) +
  //         cx +
  //         0.9 * rx * Math.cos(radialOffset + overlap * 0.5)
  //     );
  //     points.push(
  //       this.getOffset(-offset, offset) +
  //         cy +
  //         0.9 * ry * Math.sin(radialOffset + overlap * 0.5)
  //     );
  //     drawCurve(g,points);
  //   };

  getIntersectingLines(
    lineCoords: number[],
    xCoords: number[],
    yCoords: number[]
  ) {
    var intersections = [];
    var s1 = new Segment(
      lineCoords[0],
      lineCoords[1],
      lineCoords[2],
      lineCoords[3]
    );

    for (var i = 0; i < xCoords.length; i++) {
      var s2 = new Segment(
        xCoords[i],
        yCoords[i],
        xCoords[(i + 1) % xCoords.length],
        yCoords[(i + 1) % xCoords.length]
      );

      if (s1.compare(s2) == Relation.INTERSECTS) {
        intersections.push([s1.getIntersectionX(), s1.getIntersectionY()]);
      }
    }
    return intersections;
  }

  scribbleLine(
    graphics: PIXI.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    var lenSq = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    var offset = this.maxOffset;

    if (this.maxOffset * this.maxOffset * 100 > lenSq) {
      offset = Math.sqrt(lenSq) / 10;
    }

    var halfOffset = offset / 2;
    var divergePoint = 0.2 + random() * 0.2;
    var midDispX = (this.bowing * this.maxOffset * (y2 - y1)) / 200;
    var midDispY = (this.bowing * this.maxOffset * (x1 - x2)) / 200;
    midDispX = this.getOffset(-midDispX, midDispX);
    midDispY = this.getOffset(-midDispY, midDispY);

    drawCurve(graphics, [
      [
        x1 + this.getOffset(-offset, offset),
        y1 + this.getOffset(-offset, offset),
      ],
      [
        midDispX +
          x1 +
          (x2 - x1) * divergePoint +
          this.getOffset(-offset, offset),
        midDispY +
          y1 +
          (y2 - y1) * divergePoint +
          this.getOffset(-offset, offset),
      ],
      [
        midDispX +
          x1 +
          2 * (x2 - x1) * divergePoint +
          this.getOffset(-offset, offset),
        midDispY +
          y1 +
          2 * (y2 - y1) * divergePoint +
          this.getOffset(-offset, offset),
      ],
      [
        x2 + this.getOffset(-offset, offset),
        y2 + this.getOffset(-offset, offset),
      ],
    ]);

    drawCurve(graphics, [
      [
        x1 + this.getOffset(-halfOffset, halfOffset),
        y1 + this.getOffset(-halfOffset, halfOffset),
      ],
      [
        midDispX +
          x1 +
          (x2 - x1) * divergePoint +
          this.getOffset(-halfOffset, halfOffset),
        midDispY +
          y1 +
          (y2 - y1) * divergePoint +
          this.getOffset(-halfOffset, halfOffset),
      ],
      [
        midDispX +
          x1 +
          2 * (x2 - x1) * divergePoint +
          this.getOffset(-halfOffset, halfOffset),
        midDispY +
          y1 +
          2 * (y2 - y1) * divergePoint +
          this.getOffset(-halfOffset, halfOffset),
      ],
      [
        x2 + this.getOffset(-halfOffset, halfOffset),
        y2 + this.getOffset(-halfOffset, halfOffset),
      ],
    ]);
  }

  //   scribbleCurve  (x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number) {
  //     this.sketch.bezier(
  //       x1 + this.getOffset(-2, 2),
  //       y1 + this.getOffset(-2, 2),
  //       x3 + this.getOffset(-4, 4),
  //       y3 + this.getOffset(-3, 3),
  //       x4 + this.getOffset(-3, 3),
  //       y4 + this.getOffset(-3, 3),
  //       x2 + this.getOffset(-1, 1),
  //       y2 + this.getOffset(-1, 1)
  //     );

  //     this.sketch.bezier(
  //       x1 + this.getOffset(-2, 2),
  //       y1 + this.getOffset(-2, 2),
  //       x3 + this.getOffset(-3, 3),
  //       y3 + this.getOffset(-3, 3),
  //       x4 + this.getOffset(-3, 3),
  //       y4 + this.getOffset(-4, 4),
  //       x2 + this.getOffset(-2, 2),
  //       y2 + this.getOffset(-2, 2)
  //     );
  //   };

  scribbleRect(g: PIXI.Graphics, x: number, y: number, w: number, h: number) {
    var halfWidth = w / 2;
    var halfHeight = h / 2;
    var left = Math.min(x - halfWidth, x + halfWidth);
    var right = Math.max(x - halfWidth, x + halfWidth);
    var top = Math.min(y - halfHeight, y + halfHeight);
    var bottom = Math.max(y - halfHeight, y + halfHeight);

    this.scribbleLine(g, left, top, right, top);
    this.scribbleLine(g, right, top, right, bottom);
    this.scribbleLine(g, right, bottom, left, bottom);
    this.scribbleLine(g, left, bottom, left, top);
  }

  //   scribbleRoundedRect  (g:PIXI.Graphics,x:number, y:number, w:number, h:number, radius:number) {
  //     var halfWidth = w / 2;
  //     var halfHeight = h / 2;

  //     if (radius == 0 || radius > halfWidth || radius > halfHeight) {
  //       this.scribbleRect(g,x, y, w, h);
  //       return;
  //     }

  //     var left = Math.min(x - halfWidth, x + halfWidth);
  //     var right = Math.max(x - halfWidth, x + halfWidth);
  //     var top = Math.min(y - halfHeight, y + halfHeight);
  //     var bottom = Math.max(y - halfHeight, y + halfHeight);

  //     this.scribbleLine(g,left + radius, top, right - radius, top, 1.5);
  //     this.scribbleLine(g,right, top + radius, right, bottom - radius, 1.5);
  //     this.scribbleLine(g,right - radius, bottom, left + radius, bottom, 1.5);
  //     this.scribbleLine(g,left, bottom - radius, left, top + radius, 1.5);

  //     this.scribbleCurve(
  //       left + radius,
  //       top,
  //       left,
  //       top + radius,
  //       left + radius * 0.1,
  //       top + radius * 0.1,
  //       left + radius * 0.1,
  //       top + radius * 0.1
  //     );
  //     this.scribbleCurve(
  //       right - radius,
  //       top,
  //       right,
  //       top + radius,
  //       right - radius * 0.1,
  //       top + radius * 0.1,
  //       right - radius * 0.1,
  //       top + radius * 0.1
  //     );
  //     this.scribbleCurve(
  //       left + radius,
  //       bottom,
  //       left,
  //       bottom - radius,
  //       left + radius * 0.1,
  //       bottom - radius * 0.1,
  //       left + radius * 0.1,
  //       bottom - radius * 0.1
  //     );
  //     this.scribbleCurve(
  //       right - radius,
  //       bottom,
  //       right,
  //       bottom - radius,
  //       right - radius * 0.1,
  //       bottom - radius * 0.1,
  //       right - radius * 0.1,
  //       bottom - radius * 0.1
  //     );
  //   };

  //   scribbleEllipse  (x:number, y:number, w:number, h:number) {
  //     var rx = Math.abs(w / 2);
  //     var ry = Math.abs(h / 2);

  //     rx += this.getOffset(-rx * 0.05, rx * 0.05);
  //     ry += this.getOffset(-ry * 0.05, ry * 0.05);

  //     this.buildEllipse(
  //       x,
  //       y,
  //       rx,
  //       ry,
  //       1,
  //       this.ellipseInc * this.getOffset(0.1, this.getOffset(0.4, 1))
  //     );
  //     this.buildEllipse(x, y, rx, ry, 1.5, 0);
  //   };

  //   scribbleFilling  (xCoords:number[], yCoords:number[], gap:number, angle:number) {
  //     if (
  //       xCoords == null ||
  //       yCoords == null ||
  //       xCoords.length == 0 ||
  //       yCoords.length == 0
  //     ) {
  //       return;
  //     }

  //     var hachureAngle = this.sketch.radians(angle % 180);
  //     var cosAngle = Math.cos(hachureAngle);
  //     var sinAngle = Math.sin(hachureAngle);
  //     var tanAngle = Math.tan(hachureAngle);

  //     var left = xCoords[0];
  //     var right = xCoords[0];
  //     var top = yCoords[0];
  //     var bottom = yCoords[0];

  //     for (var i = 1; i < xCoords.length; i++) {
  //       left = Math.min(left, xCoords[i]);
  //       right = Math.max(right, xCoords[i]);
  //       top = Math.min(top, yCoords[i]);
  //       bottom = Math.max(bottom, yCoords[i]);
  //     }

  //     var it = new HachureIterator(
  //       top - 1,
  //       bottom + 1,
  //       left - 1,
  //       right + 1,
  //       gap,
  //       sinAngle,
  //       cosAngle,
  //       tanAngle
  //     );
  //     var rectCoords = null;

  //     while ((rectCoords = it.getNextLine()) != null) {
  //       var lines = this.getIntersectingLines(rectCoords, xCoords, yCoords);

  //       for (var i = 0; i < lines.length; i += 2) {
  //         if (i < lines.length - 1) {
  //           var p1 = lines[i];
  //           var p2 = lines[i + 1];
  //           this.scribbleLine(p1[0], p1[1], p2[0], p2[1], 2);
  //         }
  //       }
  //     }
  //   };
}

// function HachureIterator(
//   _top,
//   _bottom,
//   _left,
//   _right,
//   _gap,
//   _sinAngle,
//   _cosAngle,
//   _tanAngle
// ) {
//   var sinAngle = _sinAngle;
//   var tanAngle = _tanAngle;
//   var top = _top;
//   var bottom = _bottom;
//   var left = _left;
//   var right = _right;
//   var gap = _gap;

//   var pos;
//   var deltaX, hGap;
//   var sLeft, sRight;

//   if (Math.abs(sinAngle) < 0.0001) {
//     pos = left + gap;
//   } else if (Math.abs(sinAngle) > 0.9999) {
//     pos = top + gap;
//   } else {
//     deltaX = (bottom - top) * Math.abs(tanAngle);
//     pos = left - Math.abs(deltaX);
//     hGap = Math.abs(gap / _cosAngle);
//     sLeft = new Segment(left, bottom, left, top);
//     sRight = new Segment(right, bottom, right, top);
//   }

//   this.getNextLine = function () {
//     if (Math.abs(sinAngle) < 0.0001) {
//       if (pos < right) {
//         var line = [pos, top, pos, bottom];
//         pos += gap;
//         return line;
//       }
//     } else if (Math.abs(sinAngle) > 0.9999) {
//       if (pos < bottom) {
//         var line = [left, pos, right, pos];
//         pos += gap;
//         return line;
//       }
//     } else {
//       var xLower = pos - deltaX / 2;
//       var xUpper = pos + deltaX / 2;
//       var yLower = bottom;
//       var yUpper = top;

//       if (pos < right + deltaX) {
//         while (
//           (xLower < left && xUpper < left) ||
//           (xLower > right && xUpper > right)
//         ) {
//           pos += hGap;
//           xLower = pos - deltaX / 2;
//           xUpper = pos + deltaX / 2;

//           if (pos > right + deltaX) {
//             return null;
//           }
//         }

//         var s = new Segment(xLower, yLower, xUpper, yUpper);

//         if (s.compare(sLeft) == Relation.INTERSECTS) {
//           xLower = s.getIntersectionX();
//           yLower = s.getIntersectionY();
//         }
//         if (s.compare(sRight) == Relation.INTERSECTS) {
//           xUpper = s.getIntersectionX();
//           yUpper = s.getIntersectionY();
//         }
//         if (tanAngle > 0) {
//           xLower = right - (xLower - left);
//           xUpper = right - (xUpper - left);
//         }

//         var line = [xLower, yLower, xUpper, yUpper];
//         pos += hGap;
//         return line;
//       }
//     }
//     return null;
//   };
// }

class Segment {
  undef: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xi: number;
  yi: number;
  a: number;
  b: number;
  c: number;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    var a, b, c;
    var undef;
    this.xi = Number.MAX_VALUE;
    this.yi = Number.MAX_VALUE;

    this.a = y2 - y1;
    this.b = x1 - x2;
    this.c = x2 * y1 - x1 * y2;

    if (a == 0 && b == 0 && c == 0) {
      this.undef = true;
    } else {
      this.undef = false;
    }
  }

  compare(otherSegment: Segment) {
    if (this.isUndefined() || otherSegment.isUndefined()) {
      return Relation.UNDEFINED;
    }

    var grad1 = Number.MAX_VALUE;
    var grad2 = Number.MAX_VALUE;
    var int1 = 0;
    var int2 = 0;

    if (Math.abs(this.b) > 0.00001) {
      grad1 = -this.a / this.b;
      int1 = -this.c / this.b;
    }

    if (Math.abs(otherSegment.getB()) > 0.00001) {
      grad2 = -otherSegment.getA() / otherSegment.getB();
      int2 = -otherSegment.getC() / otherSegment.getB();
    }

    if (grad1 == Number.MAX_VALUE) {
      if (grad2 == Number.MAX_VALUE) {
        if (-this.c / this.a != -otherSegment.getC() / otherSegment.getA()) {
          return Relation.SEPARATE;
        }

        if (
          this.y1 >= Math.min(otherSegment.getPy1(), otherSegment.getPy2()) &&
          this.y1 <= Math.max(otherSegment.getPy1(), otherSegment.getPy2())
        ) {
          this.xi = this.x1;
          this.yi = this.y1;
          return Relation.INTERSECTS;
        }

        if (
          this.y2 >= Math.min(otherSegment.getPy1(), otherSegment.getPy2()) &&
          this.y2 <= Math.max(otherSegment.getPy1(), otherSegment.getPy2())
        ) {
          this.xi = this.x2;
          this.yi = this.y2;
          return Relation.INTERSECTS;
        }

        return Relation.SEPARATE;
      }

      this.xi = this.x1;
      this.yi = grad2 * this.xi + int2;

      if (
        (this.y1 - this.yi) * (this.yi - this.y2) < -0.00001 ||
        (otherSegment.getPy1() - this.yi) * (this.yi - otherSegment.getPy2()) <
          -0.00001
      ) {
        return Relation.SEPARATE;
      }

      if (Math.abs(otherSegment.getA()) < 0.00001) {
        if (
          (otherSegment.getPx1() - this.xi) *
            (this.xi - otherSegment.getPx2()) <
          -0.00001
        ) {
          return Relation.SEPARATE;
        }
        return Relation.INTERSECTS;
      }
      return Relation.INTERSECTS;
    }

    if (grad2 == Number.MAX_VALUE) {
      this.xi = otherSegment.getPx1();
      this.yi = grad1 * this.xi + int1;

      if (
        (otherSegment.getPy1() - this.yi) * (this.yi - otherSegment.getPy2()) <
          -0.00001 ||
        (this.y1 - this.yi) * (this.yi - this.y2) < -0.00001
      ) {
        return Relation.SEPARATE;
      }

      if (Math.abs(this.a) < 0.00001) {
        if ((this.x1 - this.xi) * (this.xi - this.x2) < -0.00001) {
          return Relation.SEPARATE;
        }
        return Relation.INTERSECTS;
      }
      return Relation.INTERSECTS;
    }

    if (grad1 == grad2) {
      if (int1 != int2) {
        return Relation.SEPARATE;
      }

      if (
        this.x1 >= Math.min(otherSegment.getPx1(), otherSegment.getPx2()) &&
        this.x1 <= Math.max(otherSegment.getPy1(), otherSegment.getPy2())
      ) {
        this.xi = this.x1;
        this.yi = this.y1;
        return Relation.INTERSECTS;
      }

      if (
        this.x2 >= Math.min(otherSegment.getPx1(), otherSegment.getPx2()) &&
        this.x2 <= Math.max(otherSegment.getPx1(), otherSegment.getPx2())
      ) {
        this.xi = this.x2;
        this.yi = this.y2;
        return Relation.INTERSECTS;
      }

      return Relation.SEPARATE;
    }

    this.xi = (int2 - int1) / (grad1 - grad2);
    this.yi = grad1 * this.xi + int1;

    if (
      (this.x1 - this.xi) * (this.xi - this.x2) < -0.00001 ||
      (otherSegment.getPx1() - this.xi) * (this.xi - otherSegment.getPx2()) <
        -0.00001
    ) {
      return Relation.SEPARATE;
    }
    return Relation.INTERSECTS;
  }

  getPx1() {
    return this.x1;
  }

  getPy1() {
    return this.y1;
  }

  getPx2() {
    return this.x2;
  }

  getPy2() {
    return this.y2;
  }

  isUndefined() {
    return this.undef;
  }

  getA() {
    return this.a;
  }

  getB() {
    return this.b;
  }

  getC() {
    return this.c;
  }

  getIntersectionX() {
    return this.xi;
  }

  getIntersectionY() {
    return this.yi;
  }

  getLength(tx1: number, ty1: number, tx2: number, ty2: number) {
    var dx = tx2 - tx1;
    var dy = ty2 - ty1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

var Relation = {
  LEFT: 1,
  RIGHT: 2,
  INTERSECTS: 3,
  AHEAD: 4,
  BEHIND: 5,
  SEPARATE: 6,
  UNDEFINED: 7,
};
