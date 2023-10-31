#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 iResolution;

#pragma util;

#define OCTAVES 6
float fbm (in vec2 st) {
    float value = 0.;
    float amplitude = .25;
    
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * tnoise(st);
        st *= 2.;
        amplitude *= 0.88;
    }
    return value;
}

vec3 layer(in vec2 st, in float mult, in vec3 startColor, in vec3 endColor) {
    float t = fbm(st);
    vec3 color = mix(startColor, endColor, clamp(t, -0.05, 1.25) * mult);
    return color;
}

void main() {
    vec2 st = gl_FragCoord.xy/iResolution.xy*2.;
    st.x *= iResolution.x/iResolution.y;
    
    mat2 rot = rotate2d(0.7);
    st = st * rot + 0.7;
    st.x += 10.;

    float n = noise(st*100.) * 0.005;
    // layer 1 - base
    vec3 color = layer(st * 3. + n, 1., vec3(0.05,0.05,0.05), vec3(0.9,0.9,0.9));
    // layer 2 - small amount of dithering to introduce distortion
    color = (color + dither8x8(st*0.1, color)) / 2.;
    // layer 3 - red, going the opposite direction
    color = layer((1. - st) * 3. + n, 0.25, color, normalizeRgb(209.,57.,15.));
    // layer 4 - orange, slightly offset from layer 1
    color = layer(st * 3.01 + tnoise(st) * 0.03, 0.3, color, normalizeRgb(232.,105.,23.));
    // layer 5 - blue, slightly offset from layer 4, for depth
    color = layer(st * 3.02 + n, 0.25, color, normalizeRgb(23.,232.,225.));
    // layer 6 - orange again, smoky texture
    color = layer((st + noise(st * 0.1) + 100.) * 0.4, 0.25, color, normalizeRgb(232.,105.,23.));

    gl_FragColor = vec4(color,1.0);
}
