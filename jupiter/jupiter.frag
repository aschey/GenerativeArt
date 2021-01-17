// Heavily borrowed from the last example in this article https://thebookofshaders.com/13/

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.141592653589

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
#define random_seed 7.2

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), sin(_angle),
                -sin(_angle), cos(_angle));
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Use quintic interpolation curve instead of cubic for more detail
    //vec2 u = f * f * (3.0 - 2.0 * f);
    vec2 u = f * f * f * (f * (f * 6. - 15.) + 10.);

    return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y ;
}

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

vec3 normalizeRgb(float r, float g, float b) {
    return vec3(r, g, b) / vec3(256.);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // reshape into a square
    float x_mult = u_resolution.x/u_resolution.y;
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
