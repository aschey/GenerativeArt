const COLORSCHEME = COLORS.winterOrange;
const ALPHA = 'FF';

// Max x distance from trunk on either side
const MAX_X = 15;
// Branches cannot go more than n times higher than the trunk height
const MIN_Y_FACTOR = 2;
// Branches off the trunk can start no less than n * trunkHeight from the base of the trunk
const MIN_Y_THRESH_FACTOR_BOTTOM = 0.1;
// Branches off the trunk can start no more than n * trunkHeight from the base of the trunk
const MAX_Y_THRESH_FACTOR_BOTTOM = 0.5;
// Branches off the trunk can end no less than n * trunkHeight from the base of the trunk
const MIN_Y_THRESH_FACTOR_TOP = 0.05;
// Branches off the trunk can end no more than n * trunkHeight from the base of the trunk
const MAX_Y_THRESH_FACTOR_TOP = 0.1;
// Min percentage of the end of the branch to allow creating new branches off of
const MIN_X_THRESH_END = 0.1;
// Max percentage of the end of the branch to allow creating new branches off of
const MAX_X_THRESH_END = 0.7;
// Minimum variance from START_X or START_Y to place a new tree
const PLACE_VAR_MIN = -20;
// Maximum variance from START_X or START_Y to place a new tree
const PLACE_VAR_MAX = 10;
// Minimum trunk height
const MIN_TRUNK_HEIGHT = 20;
// Maximum trunk height
const MAX_TRUNK_HEIGHT = 50;
// Starting x coord to place trees
const START_X = 60;
// Starting y coord to place trees
const START_Y = 60;
// Minimum amount of distance allowed between branches
const DIST_THRESH = 3;
// Factor to multiply x value by when calculating Perlin noise
const X_NOISE_RATIO = 0.01;
// Factor to multiply y value by when calculating Perlin noise
const Y_NOISE_RATIO = 0.1;
// Number of octaves to use for Perlin noise
const NOISE_OCTAVES = 4;
// Factor to use for Perlin noise falloff
const NOISE_FALLOFF = 0.2;
// Minimum variance to multiply the noise value by when applying y variance
const NOISE_POINT_VAR_MIN = -2;
// Maximum variance to multiply the noise value by when applying y variance
const NOISE_POINT_VAR_MAX = 5
// Minimum change in x/y values when adding background textures
const BG_DELTA_MIN = 1;
// Maximum change in x/y values when adding background textures
const BG_DELTA_MAX = 2;
// Line thickness
const THICKNESS = 2;
// Background texture thickness
const BG_THICKNESS = 1;
// Max iterations before terminating generation
const MAX_ITERS = 100000;
// Noise threshold for choosing a bush
const BUSH_THRESH = 0.2;
// Min trunk height for bushes
const BUSH_MIN_HEIGHT = 5;
// Max trunk height for bushes
const BUSH_MAX_HEIGHT = 10;
const BUSH_VAR_X = 15;
const BUSH_VAR_Y = 15;
const BUSH_MIN_BRANCHES = 15;
const BUSH_MAX_BRANCHES = 25;

const TYPES = {
    normal: {
        xMean: 0,
        xStdDev: 7,
        yMean: -13,
        yStdDev: 3,
        minBranches: 10,
        maxBranches: 25,
        trunkPropensity: 0.1,
        maxBranchOffCount: 10,
        minSlopeThresh: 0.02,
        maxSlopeThresh: 0.5, 
        probMin: 0.0,
        probMax: 0.5,
        xDiffRatio: 0.5,
        yDiffRatio: 0.5,
        lineSelector: numLines => random(numLines - 1) 
    },
    skinny: {
        xMean: 0,
        xStdDev: 3,
        yMean: -10,
        yStdDev: 3,
        minBranches: 15,
        maxBranches: 25,
        trunkPropensity: 0.3,
        maxBranchOffCount: 10,
        minSlopeThresh: 0.02,
        maxSlopeThresh: 0.5, 
        probMin: 0.5, 
        probMax: 0.7,
        xDiffRatio: 0.1,
        yDiffRatio: 0.9,
        lineSelector: numLines => random(numLines - 1)
    },
    fat: {
        xMean: 0,
        xStdDev: 7,
        yMean: -3,
        yStdDev: 2,
        minBranches: 25,
        maxBranches: 35,
        trunkPropensity: 0.7,
        maxBranchOffCount: 5,
        minSlopeThresh: 0.01,
        maxSlopeThresh: 0.01, 
        probMin: 0.7, 
        probMax: 1.0,
        xDiffRatio: 1,
        yDiffRatio: 0.1,
        lineSelector: numLines => limitedGaussian(numLines * 0.25, numLines * 0.25, 0, numLines - 1)
    }
}