// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.141592653589

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
#define random_seed 5.5

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

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y ;
}



#define NUM_OCTAVES 8

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(0.);
    // Rotate to reduce axial bias
    mat2 rot = mat2(1.);
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st *= (cos(random_seed * 0.0001) * 3.) + shift;
        a *= 0.5;
    }
    return v;
}



float rfbm(vec2 p) {
    const int iters = 1;
    vec2 f = p + fbm(p);
    for (int i = 0; i < iters; i++) {
        f = vec2(fbm(f + fbm(f)));
    }
    return f.x;
}

vec2 swirl(vec2 _st) {
    float len = length(vec2(_st.x * 0.9, _st.y));
    float effectRadius = .3;
    float effectAngle = 2.5 * PI;
    float angle = atan(_st.y, _st.x * 1.1) 
        + (effectAngle * smoothstep(0., effectRadius, len) 
           + noise(_st * cos(random_seed) * 10.)); 
        
    return vec2(len * cos(angle), len * sin(angle));
}


void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 st2 = st;
    float rad = length(0.5-st2);
    
    //float theta = PI + ((atan(st2.y,st2.x)) + ( 2. * PI));
    st.x = 0.64 - st.x;
    st.y = 0.3 - st.y;
    st = swirl(st);
    st = rotate2d(PI*0.5) * st;
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
                clamp(length(q),0.0,1.0)  * smoothstep(0.,1.1, st2.y)));
    
    float n = abs(noise(swirl(st)));
    color += vec3(n*2., -n*.5, -n*2.) * (1.-smoothstep(0., 1., rad2));
	color *= (0.*f*f*f + 1.2*f*f + 0.6*f);
    
    gl_FragColor = vec4(color,1.);
}
