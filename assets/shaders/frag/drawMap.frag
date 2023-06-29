#define PI 3.1415926

uniform float uTime;
uniform float uFrameCount;
uniform vec2 uSize;
uniform vec2 uMousePos;
uniform bvec3 uMouseButtons;

uniform sampler2D tDraw;
uniform sampler2D tDepthDown;


in vec2 vUv;

float rand (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))
    * 43758.5453123);
}

float cnoise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float surface3 ( vec3 coord ) {
        float frequency = 4.0;
        float n = 0.0;  
        n += 1.0    * abs( cnoise( vec2(coord * frequency) ) );
        n += 0.5    * abs( cnoise( vec2(coord * frequency * 2.0) ) );
        n += 0.25   * abs( cnoise( vec2(coord * frequency * 4.0) ) );
        return n;
}

vec3 generateNormal(sampler2D tex, vec2 texCoord, vec2 texelSize) {
    vec3 dx = vec3(texelSize.x, 0.0, texture(tex, texCoord + vec2(texelSize.x, 0.0)).r - texture(tex, texCoord - vec2(texelSize.x, 0.0)).r);
    vec3 dy = vec3(0.0, texelSize.y, texture(tex, texCoord + vec2(0.0, texelSize.y)).r - texture(tex, texCoord - vec2(0.0, texelSize.y)).r);
    return normalize(cross(dy, -dx));
}

vec3 generateNormal2(sampler2D tex, vec2 texCoord, vec2 texelSize) {
    vec3 n;
    n.x = texture(tex, texCoord + vec2(texelSize.x, 0.0)).r - texture(tex, texCoord - vec2(texelSize.x, 0.0)).r;
    n.y = 1.0;
    n.z = texture(tex, texCoord + vec2(0.0, texelSize.y)).r - texture(tex, texCoord - vec2(0.0, texelSize.y)).r;
    return normalize(n);
}

int vec3ToInt(vec3 color) {
  vec3 scaledColor = color * 255.0;
  vec3 roundedColor = round(scaledColor);
  int intValue = int(roundedColor.r) * 256 * 256 + int(roundedColor.g) * 256 + int(roundedColor.b);
  return intValue;
}


vec4 color = vec4(0.0);
vec3 startColor = vec3(0.0);

void main() {

  vec2 tDrawSize = vec2(textureSize(tDraw, 0));


  color.rgb = texture(tDraw, vUv).rgb;

  vec2 mousePos = uMousePos.xy * 0.5 + 0.5;
  mousePos.y *= 0.5;
  mousePos.y *= 2.0;
  mousePos.y -= 0.5;

  vec2 st = vUv;
  st.y *= 2.0;
  st.y -= 0.5;


  float drawR = 0.1;
  float touchR = 0.25;


  if (st.y <= 0.5) { 
  //# TOUCH MAP

    if (uFrameCount <= 1.0) {
      color.rgb = startColor;
    }

      float dist = distance(st, mousePos) * 2.0;
      float t = uTime*0.5;

      if (dist < touchR) {
        vec2 st = (st-(mousePos));
        color.rg = (normalize(st)*0.5+0.5);
        color.b = 1.0;
      }

      color.rgb -= 0.01;

  } else { 
    //# START COLOR
    if (uFrameCount <= 1.0) {
      color.rgb = startColor;
    }

    //# DRAW MAP
    //if (uMouseButtons[0]) 
    {
      float dist = distance(st, mousePos + vec2(0.0, 1.0)) * 2.0;
      float t = uTime*0.5;

      if (dist < drawR) {
        color.rgb = vec3(
          sin(t)*0.5+0.5, 
          sin(-t)*0.5+0.5, 
          cos(t)*0.5+0.5
        )*1.25;
      }
    }


  }

  gl_FragColor = vec4(color.rgb, 1.0);
}