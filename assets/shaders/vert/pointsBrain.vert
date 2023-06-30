#define PI 3.1415926

uniform sampler2D tDepthTop;


uniform float uTime;
uniform vec4 uMousePos;
uniform vec3 uViewPos;


out float vInstanceID;
out vec3 vNormal;
out vec3 vPos;
out vec2 vUv;
out float vIsDrop;

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


  //! POSITION
  vec3 pos = position;
  //pos.y += 1.0;


  

/*
  //! DROP FRASH
  float t = uTime*0.75;
  t = mod(t, PI);

  float s = sin(t);

  //pos.y -= tan(t+s)/pos.y*rand(pos.xz)+s;
  pos.y -= tan(t+s)/pos.y*rand(pos.xz);
  pos.y = clamp(pos.y, position.y-0.25, position.y);

  if (t >= 0.833) {
    pos.y += tan(t+s)/pos.y*rand(pos.xz);
    pos.y = clamp(pos.y, position.y-0.25, position.y);
  }
*/







  


  
  //! V2
  /*
  float t = (uTime+rand(pos.xz))*PI;
  pos.y -= tan(t)*0.01;
*/

  //! V3
  /*vec3 downwardDirection = vec3(0.0, -1.0, 0.0);
  float dotProduct = dot(normal, downwardDirection);

  float t = (uTime*1.5);

  //pos.y -= t;
  //pos.y = mod(pos.y+rand(pos.xz)*5.0, 5.0)-2.5;

  if (mod(idx, 4.0) == 0.0) {
    if (dotProduct >= 0.0) 
    {
      pos.y = mod(pos.y+rand(pos.xz)*5.0, 5.0)-2.5;
    }
  }*/




  vec4 modelViewPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
  gl_PointSize = (2.0-normalize(distance(pos, uViewPos)));

  
  vInstanceID = idx;
  vNormal = normal;
  vPos = pos;
}


// if (pos.x < 0.0)