#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.141592653589

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
#define random_seed 7.2

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    //vec2 u = f * f * (3.0 - 2.0 * f);
    vec2 u = f * f * f * (f * (f * 6. - 15.) + 10.);

    return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y ;
}



#define NUM_OCTAVES 8

float fbm ( in vec2 _st) {
    float v = 0.;
    float a = 0.5;

    for (int i = 0; i < NUM_OCTAVES; i++) {
        float f = float(i);
        float ff = noise(vec2(f));
        mat2 rot = mat2(cos(ff), sin(ff),
                    -sin(ff), cos(ff));
        v += a * noise(_st * 0.9);
        _st = _st * rot * (cos(f) + 3.);
        a *= 0.5;
    }
    return v;
}



float rfbm(vec2 p) {
    const int iters = 2;
    vec2 f = p;
    for (int i = 0; i < iters; i++) {
        f += p + fbm(f);
    }
    return fbm(f);
}

vec2 swirl(vec2 _st) {
    float len = length(vec2(_st.x, _st.y * 0.85));
    float effectRadius = .3;
    float effectAngle = 2.5 * PI;
    float angle = atan(_st.y * 1.15, _st.x) 
        + (effectAngle * smoothstep(0., effectRadius, len) 
           + noise(_st * cos(random_seed) * 11.)); 
        
    return vec2(len * cos(angle), len * sin(angle));
}


void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    float x_mult = u_resolution.x/u_resolution.y;
    st.x *= x_mult;
   
    st.x = 0.64 * x_mult - st.x;
    st.y = 0.6 - st.y;
    st = swirl(st);
    st = rotate2d(PI*1.) * st;
    st *= 3.;
    float rad2 = length(st);
    
    vec3 color = vec3(0.0);

    vec2 q = vec2(fbm(st));
   
    vec2 p = st + q;
    float f = rfbm(p);
    
    color = (mix(vec3(237./256.,51./256.,31./256.),
                vec3(173./256.,62./256.,31./256.),
                clamp(length(q),0.0,1.0)));

    color = (mix(color,
                vec3(209./256.,83./256.,4./256.),
                clamp(length(q),0.0,1.0)));

    color = (mix(color,
                vec3(219./256.,191./256.,180./256.),
                clamp(length(q),0.0,1.0)));
    
    float n = abs(noise(swirl(st)));
    color += vec3(n*3., -n, -n*3.) * (1.-smoothstep(0., 1., rad2));
	color *= (0.3*f*f*f + 1.2*f*f + 0.6*f);
    
    gl_FragColor = vec4(color,1.);
}
