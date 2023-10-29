// Heavily borrowed from the last example in this article https://thebookofshaders.com/13/

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define PI 3.141592653589

uniform vec2 iResolution;
varying vec2 vPosition;
#define random_seed 7.2

#pragma util;

// fractional brownian motion
float fbm (vec2 _st) {
    float v = 0.;
    float a = 0.5;
    const int NUM_OCTAVES = 8;
    for (int i = 0; i < NUM_OCTAVES; i++) {
        float f = float(i);
        float noiseF = noise(vec2(f));
        v += a * noise(_st * 0.9);
        _st = _st * rotate2d(noiseF) * (cos(f) + 3.);
        a *= 0.5;
    }
    return v;
}

// Domain warping based on technique here https://www.iquilezles.org/www/articles/warp/warp.htm
float warp(vec2 p) {
    const int iters = 2;
    vec2 f = p;
    for (int i = 0; i < iters; i++) {
        f += p + fbm(f);
    }
    return fbm(f);
}

vec2 swirl(vec2 _st) {
    // Modify y component so it isn't a perfect circle
    float yMod = 0.15;
    float len = length(vec2(_st.x, _st.y * (1. - yMod)));
    float effectRadius = .3;
    float effectAngle = 2.5 * PI;
    
    // adding noise(_st * some_large-ish_number) here is what overloads the swirl effect
    // and creates smaller swirls elsewhere in the image
    float angle = atan(_st.y * (1. + yMod), _st.x) 
        + (effectAngle * smoothstep(0., effectRadius, len) + noise(_st * cos(random_seed) * 11.)); 
        
    return vec2(cos(angle), sin(angle)) * len;
}

void main() {
    vec2 st = vPosition;

    // reshape into a square
    float x_mult = iResolution.x/iResolution.y;
    st.x *= x_mult;
    
    // change center coordinate to create swirl effect at on offset
    st.x = 0.64 * x_mult - st.x;
    st.y = 0.6 - st.y;
    st = swirl(st);

    st *= rotate2d(PI);
    st *= 3.;

    vec2 q = vec2(fbm(st));
    float f = warp(st + q);

    // Blend colors
    float qDist = clamp(length(q),0.0,1.0);
    vec3 color = mix(normalizeRgb(237., 51.,31.),
                    normalizeRgb(173.,62.,31.), qDist);
    color = mix(color, normalizeRgb(209.,83.,4.), qDist);
    color = mix(color, normalizeRgb(219.,191.,180.), qDist);
    
    float n = noise(swirl(st));
    float dist = length(st);

    // Redshift colors inside the swirl
    color += vec3(n*3., -n, -n*3.) * (1. - smoothstep(0., 1., dist));
    // Amplify warped pattern
    color *= (0.3*f*f*f + 1.2*f*f + 0.6*f);
    
    gl_FragColor = vec4(color,1.);
}
