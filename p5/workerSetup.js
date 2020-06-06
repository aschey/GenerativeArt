// WARNING: hackiness ahead

// p5 tries to use all of these features that aren't available in web workers so we have to stub them out
const window = { performance: Date, addEventListener: (key, func) => null };
const document = { hasFocus: () => true }
const screen = { width: 0, height: 0 }
self.document = { createElementNS: (key, val) => [] };

importScripts('../../../node_modules/p5/lib/p5.js');

// All of these are globally accessible in the window context but we have to bind them to the p5 context to use them in a web worker
const p5 = new window.p5();
const random = p5.random.bind(p5);
const noise = p5.noise.bind(p5);
const min = p5.min.bind(p5);
const max = p5.max.bind(p5);
const round = p5.round.bind(p5);
const randomGaussian = p5.randomGaussian.bind(p5);