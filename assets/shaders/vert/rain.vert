#define PI 3.1415926

uniform sampler2D tDepthTop;


uniform float uTime;
uniform vec4 uMousePos;
uniform vec3 uViewPos;



out float vInstanceID;
out vec3 vPos;
out float vIsDrop;
out float vDepth;
out vec3 vColor;

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

vec3 generateNormal(sampler2D tex, vec2 texCoord, vec2 texelSize) {
    vec3 dx = vec3(texelSize.x, 0.0, texture(tex, texCoord + vec2(texelSize.x, 0.0)).r - texture(tex, texCoord - vec2(texelSize.x, 0.0)).r);
    vec3 dy = vec3(0.0, texelSize.y, texture(tex, texCoord + vec2(0.0, texelSize.y)).r - texture(tex, texCoord - vec2(0.0, texelSize.y)).r);
    return normalize(cross(dy, -dx));
}



void main() {
  float idx = float(gl_InstanceID);
  float x = mod(idx, 100.0);
  float z = floor(idx / 100.0);
  float y = mod(idx, 2.0);

  //! POSITION
  vec3 pos = vec3(x, 0.0, z);
  pos.xz *= 0.014;
  pos.xz -= 0.7;
  //pos.y += 1.0;


  vec2 depthUV = pos.xz/1.3+0.5;
  depthUV.y = 1.0-depthUV.y;
  vec2 depthTexelSize = (1.0/vec2(textureSize(tDepthTop, 0)));
  float depth = (1.0-texture(tDepthTop, depthUV).r);

  pos.y -= uTime*rand(vec2(x, z));


  pos.y = mod(pos.y, 5.0)-2.5;

  if (pos.y < depth && depth != 0.0) {
    vec3 normalMap = (generateNormal(tDepthTop, depthUV, depthTexelSize)*0.5+0.5);
    vec3 normal = 2.0*normalMap-1.0;
    float dotProduct = dot(normal, vec3(0.0, -1.0, 0.0));

    float t = tan(pos.y*0.6);

    vDepth = (depth);
    vColor = normalMap;

    //pos.xz -= (pos.y*(2.0*normal.xy-1.0)*0.1)/dotProduct;


    //pos.xz += sin((uTime+tan(pos.y*0.3)*10.0)+(rand(pos.xz)*0.2))*0.01;

    pos.xz += (normal.xy*(pos.y))*0.025;

    pos.y = depth+t*0.1*(-pos.y);
    pos.y *= 0.5;

/*
    //! DROP FRASH
    float td = uTime*0.75;
    td = mod(td, PI);

    float s = sin(td);

    pos.y -= tan(td+s)/pos.y;

    if (td >= 0.833) {
      pos.y += tan(td+s)/pos.y;
    }
*/

    gl_PointSize = (3.0);
  } else {
    vColor = vec3(31.0, 24.0, 192.0) / 255.0;
    gl_PointSize = (2.0);
  }


  if (pos.y < 0.0) {
    vColor -= pos.y;
  }



  vec4 modelViewPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;




  vInstanceID = idx;
  vPos = pos;
}


// if (pos.x < 0.0)


/*
  float depth = (1.0-texture(tDepthTop, pos.xz/1.3+0.5).r);

  pos.y -= uTime+rand(vec2(x, z));


  pos.y = mod(pos.y, 5.0)-2.5;

  if (pos.y < depth && depth != 0.0) {
    pos.y = depth;
    pos.y *= 0.5;
    vDepth = (depth);
  }
  */