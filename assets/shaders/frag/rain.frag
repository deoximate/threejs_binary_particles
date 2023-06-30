
#define PI 3.14159265359
#define PI2 6.28318530718

uniform sampler2D tMask;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uViewPos;

in float vInstanceID;
in float vDepth;
in vec3 vPos;
in float vIsDrop;
in vec3 vColor;


float rand (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))
    * 43758.5453123);
}

vec3 color = vec3(0.2);

void main() {

  vec2 tMaskSize = vec2(textureSize(tMask, 0));
  vec2 uv = gl_FragCoord.xy / tMaskSize.xy;

  float r = rand(vec2(floor((uv.x*27.0*2.0)), 0.0))*0.2+0.1;
  float offsetY = uTime*r;
  float v = texture(tMask, uv*2.0+vec2(0.0, offsetY)).r;

  //color += 1.1-v;
  color += 1.0-v;

  gl_FragColor = vec4(color, 1.0);
}