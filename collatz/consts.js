const COLORSCHEME = COLORS.autumn;
const ALPHA = 'AA';

// mean for gauss randomization of lines
const LINE_MEAN = 0;
// std dev for gauss randomization of lines
const LINE_STD_DEV = 4;
// start collatz number
const START_N = 0;
// end collatz number
const END_N = 500;
// line color alpha

// probability of choosing a colored line
const COLOR_LINE_PROB = 0.2;
// coefficient to pass to noise() for x and y coords
const LINE_NOISE_RATIO = 0.2;
// change in x values when creating background texture
const BG_DELTA_X = 10;
// change in y values when creating background texture
const BG_DELTA_Y = 10;
// variance when choosing background coords
const BG_VAR = 5;
// background starting color
const BG_BASE_COLOR = 100;
// gaussian mean for background color adjustment percentage (0 - 1.0)
const BG_MEAN = 0.7;
// gaussian std dev for background color adjustment percentage (0 - 1.0)
const BG_STD_DEV = 0.2;
// start y value for adding fill squares
const SQUARES_START_Y = 25;
// change in y value for adding fill squares
let SQUARES_DELTA_Y = 0;
// change in x value for adding fill squares
let SQUARES_DELTA_X = 0;
try {
    SQUARES_DELTA_Y = Math.round(25 * (1 / window.devicePixelRatio));
    SQUARES_DELTA_X = Math.round(25 * (1 / window.devicePixelRatio));
}
catch (e) {
    // Happens in worker because window is not defined
}
// variance when choosing coords for fill squares
const SQUARES_VAR = 12;
let MAX_SQUARE_SIDE = 0;
try {
    MAX_SQUARE_SIDE = 100 * (1 / window.devicePixelRatio);
}
catch (e) {
    // Happens in worker because window is not defined
}
const IGNORE_DIAG_LENGTH = 10;
const IGNORE_DIAG_LOWER_SLOPE = 0.05;
const IGNORE_DIAG_UPPER_SLOPE = 10;

const THICKNESS = 1;

// Number of octaves to use for Perlin noise
const NOISE_OCTAVES = 4;
// Factor to use for Perlin noise falloff
const NOISE_FALLOFF = 0.2;