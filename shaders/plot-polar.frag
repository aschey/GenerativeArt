#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.141592653589793238

float plot(float f, float r) {
  return  smoothstep( f-0.02, f, r) -
          smoothstep( f, f+0.02, r);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    vec2 pos = 0.5 - st;
    float r = length(pos)*2.;
    vec3 color = vec3(0.);
    for (int i = 0; i < 5; i++) {
        float theta = PI + ((atan(pos.y,pos.x)) + ( 2. * PI * float(i)));
        float f = cos(theta * PI);
        color += plot(f, r);
    }

    gl_FragColor = vec4(color, 1.0);
}
