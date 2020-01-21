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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function intersects(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b) {
    var det, gamma, lambda;
    det = (x2a - x1a) * (y2b - y1b) - (x2b - x1b) * (y2a - y1a);
    if (det === 0) {
        return false;
    } 
    else {
        lambda = ((y2b - y1b) * (x2b - x1a) + (x1b - x2b) * (y2b - y1a)) / det;
        gamma = ((y1a - y2a) * (x2b - x1a) + (x2a - x1a) * (y2b - y1a)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
};

function getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// taken from https://github.com/lovasoa/graham-fast/blob/master/index.js
// See https://en.wikipedia.org/wiki/Graham_scan
function grahamScan(points) {
    // The enveloppe is the points themselves
    if (points.length <= 3) return points;
    
    // Find the pivot
    var pivot = points[0];
    for (var i=0; i<points.length; i++) {
        if (points[i].y < pivot.y || (points[i].y === pivot.y && points[i].x < pivot.x)) {
            pivot = points[i];
        }
    }

    // Attribute an angle to the points
    for (var i=0; i<points.length; i++) {
        points[i]._graham_angle = Math.atan2(points[i].y - pivot.y, points[i].x - pivot.x);
    }
    points.sort(function(a, b){return a._graham_angle === b._graham_angle
                                        ? a.x - b.x
                                        : a._graham_angle - b._graham_angle});

    // Adding points to the result if they "turn left"
    var result = [points[0]], len=1;
    for(var i=1; i<points.length; i++){
        var a = result[len-2],
            b = result[len-1],
            c = points[i];
    while (
        (len === 1 && b.x === c.y && b.y === c.y) ||
        (len > 1 && (b.x-a.x) * (c.y-a.y) <= (b.y-a.y) * (c.x-a.x))) {
        len--;
        b = a;
        a = result[len-2];
    }
        result[len++] = c;
    }
    result.length = len;
    return result;
}

function getPixel(x, y) {
    index = round(4 * ((y * d) * width * d + (x * d )));
    return [pixels[index], pixels[index + 1], pixels[index + 2]];
}
