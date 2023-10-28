#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif


varying vec2 vPosition;

#define PI 3.141592653589

mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), sin(_angle),
                -sin(_angle), cos(_angle));
}

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  vPosition = (modelPosition.xy * vec2(0.6,1.2) + vec2(-0.6,0.3)) * rotate2d(PI * 0.5);
  gl_Position = modelPosition;
}