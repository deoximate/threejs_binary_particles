#define PI 3.1415926

//uniform sampler2D tDraw;


uniform float uTime;
uniform vec4 uMousePos;
uniform vec3 uViewPos;


out float vInstanceID;
out vec3 vNormal;
out vec3 vPos;

float rand (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))
    * 43758.5453123);
}

float cnoise (vec2 n) {
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

float normalizeRange (float value, float minValue, float maxValue) {
  return ((value - minValue) / (maxValue - minValue))*2.0-0.5;
}



void main() {
  float idx = float(gl_VertexID);
  float x = mod(idx, 1.0);
  float z = floor(idx / 1.0);
  float y = mod(idx, 2.0);

  //! POSITION
  vec3 pos = position;


  pos *= 0.5+surface3(pos+uTime*0.025)*2.5;


  vec3 downwardDirection = vec3(0.0, -1.0, 0.0);
  float dotProduct = dot(normal, downwardDirection);
  if (abs(dotProduct ) >= 1.0) {
    pos = vec3(0.0, 0.0, -10000.0);
  }

  vec4 modelViewPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
  gl_PointSize = (8.0-normalize(distance(pos, uViewPos)));

  
  vInstanceID = idx;
  vNormal = normal;
  vPos = pos;
}