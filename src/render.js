import * as THREE from 'three';
//import { ShaderChunk } from 'three';
/*import { Font } from 'three/addons/loaders/FontLoader.js';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
*/
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderTargetCreator } from './RenderTargetCreator.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



const { PI, PI2, sin, cos } = Math;



let frameCount = 0;

const PATH = {
  fonts: "assets/fonts/",
  models: "assets/models/",
  textures: "assets/textures/",
  shaders: "assets/shaders/",
}

let isAssetsLoad = false;


const models = {}
const meshes = {}
const materials = {}
const textures = {}
const renderTargets = {}
const lights = {}
const userData = new Map();
let isDraw = true;

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas
});

console.info(
  "ThreeJS",
  THREE.REVISION,
  renderer.getContext().getParameter(renderer.getContext().VERSION)
);


//! SCENES & LIGHT & COLOR
const scene = new THREE.Scene();
const scene2D = new THREE.Scene();
const drawScene = new THREE.Scene();


lights.dir = new THREE.DirectionalLight(0xFFFFFF, 1);
lights.dir.position.set(10, 10, 10);
lights.amb = new THREE.AmbientLight(0xFFFFFF, 0.0);

scene.add(lights.dir);
scene.add(lights.amb);


renderer.setClearColor(0xFFFFFF);
/*
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.alpha = true;
renderer.setClearColor( 0x000000, 0 );
scene.background = null;
scene2D.background = null;
*/


//! CAMERS & CONTROLLERS
const fov = 75;
const aspect = 2;
const near = 0.01;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 2);

const cameraOrthoDraw = new THREE.OrthographicCamera(
  -0.5, 0.5, 0.5, -0.5, 0, 1
);


const controlsC = new OrbitControls(camera, renderer.domElement);
controlsC.enablePan = false;
controlsC.minDistance = 1;
controlsC.maxDistance = 2;






//! CREATE FBOs
const fbo = new RenderTargetCreator(THREE);
renderTargets['draw'] = fbo.create(256, 512, { isSave: true });





//! UNIFORMS
const uniforms = {
  // common uniforms
  uTime: { value: 0.0 },
  uFrameCount: { value: 0.0 },
  uResolution: { value: { x: canvas.clientWidth, y: canvas.clientHeight } },
  uMousePos: { value: { x: 0, y: 0 } },
  uMouseButtons: { value: [false, false, false] },
  uViewPos: { value: new THREE.Vector3() },


  // textures
  tDraw: { value: null },
  tMask: { value: null },
};



//! LOADERS
const loadManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadManager);
const fileLoader = new THREE.FileLoader(loadManager);
const gltfLoader = new GLTFLoader(loadManager);




const loaderDOM = document.querySelector('#loading');
loaderDOM.style.display = 'none';

loadManager.onProgress = (url, loaded, total) => {
  console.log(
    `%c${url}`, 'color: #00FF00',
    `${Math.round(100 * ((loaded - 1) / total))}%`
  );
};


loadManager.onLoad = () => {
  console.log('%cASSETS LOADED', 'color: yellow');
  loaderDOM.style.display = 'none';
  isAssetsLoad = true;
};

loadManager.onError = (url) => {
  console.error("Load error:", url.split("undefined").join(''));
};

//await loadFiles();
await loadTextures();
await loadShaders();
await loadModels();
start()




//! LOAD FILES
async function loadFiles() {

}

//! LOAD TEXTURES
async function loadTextures() {
  const texture = await textureLoader.loadAsync(
    PATH.textures + 'binary.png', (texture) => {
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });

  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  uniforms.tMask.value = texture;
}

//! LOAD SHADERS
async function loadShaders() {
  const shaderConfigs = [
    //{ name: "draw", vert: "default.vert", frag: "drawMap.frag" },
    { name: "points", vert: "points.vert", frag: "points.frag" },
    { name: "back", vert: "back.vert", frag: "back.frag" },
  ];

  for (const { name, vert, frag } of shaderConfigs) {
    const pathVert = PATH.shaders + 'vert/' + vert;
    const pathFrag = PATH.shaders + 'frag/' + frag;

    materials[name] = new THREE.ShaderMaterial({
      uniforms: uniforms
    });

    if (vert) {
      const vertSrc = await fileLoader.loadAsync(pathVert);
      materials[name].vertexShader = vertSrc;
    }

    if (frag) {
      const fragSrc = await fileLoader.loadAsync(pathFrag);
      materials[name].fragmentShader = fragSrc;
    }
  }
}

//! LOAD MODELS
async function loadModels() {
  const gltf = await gltfLoader.loadAsync(PATH.models + 'gltf/brain_areas.glb');
  const model = gltf.scene.children[0];

  model.traverse((object) => {
    const name = object.name;
    console.log(name);
  });

  models.brain = model;
  //scene.add(model);
}

//! LOAD FONTS
async function loadFonts() {
  loaderTTF.load(PATH.fonts + "Rubik-Bold.ttf", (json) => {
    const font = new Font(json);
    const size = 0.5;

    const textGeo = new TextGeometry('GLSL', {
      font: font,
      size: size,
      height: 0,
      curveSegments: 5,
      bevelEnabled: false
    });

    materials.text.transparent = true;
    materials.text.side = THREE.DoubleSide;


    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    const textMesh1 = new THREE.Mesh(textGeo, materials.text);

    const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = -size * 0.5;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = 0;

    scene.add(textMesh1);
  });
}







//! START 
function start() {
  /*
    // DRAW FBO
    meshes.renderFBO = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: renderTargets['draw'][0].texture,
      })
    );
    scene2D.add(meshes.renderFBO);
    meshes.renderFBO.position.set(0, 0, 0);
  */

  // FBO PLANE
  meshes.drawPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.draw);
  drawScene.add(meshes.drawPlane);


  meshes.sphere = new THREE.LineSegments(
    new THREE.SphereGeometry(0.25, 32, 32),
    new THREE.LineBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.2
    })
  );

  //scene.add(meshes.sphere);



  const geometry = new THREE.BufferGeometry();
  const modelGeometry = models.brain.geometry.clone();
  const vertices = modelGeometry.attributes.position.array;
  const normals = modelGeometry.attributes.normal.array;

  geometry.setAttribute(
    'position', new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute(
    'normal', new THREE.Float32BufferAttribute(normals, 3)
  );

  materials.points.transparent = true;

  const points = new THREE.Points(geometry, materials.points);
  scene.add(points);


  materials.back.transparent = true;
  meshes.back = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    materials.back
  )
  meshes.back.position.z = -1;
  scene.add(meshes.back);



  onResize(renderer);
}






//! MOUSE EVENTS
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);


function onMouseMove(event) {
  mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

  uniforms.uMousePos.value.x = mouse.x;
  uniforms.uMousePos.value.y = mouse.y;

}

function onMouseDown(event) {
  const button = event.button;
  uniforms.uMouseButtons.value[button] = true;
}

function onMouseUp(event) {
  const button = event.button;
  uniforms.uMouseButtons.value[button] = false;
  controlsC.enableRotate = true;
}




window.onresize = () => onResize(renderer);
onResize(renderer);
window.onload = () => onResize(renderer);


//?-----------------------------------------------------------------------------------------
//?-----------------------------------------------------------------------------------------
//?-----------------------------------------------------------------------------------------

function update(time, delta) {

  renderer.autoClearColor = true;

  //# UNIFORMS
  uniforms.uTime.value = time;
  uniforms.uFrameCount.value = frameCount;
  uniforms.uViewPos.value = camera.position;


  //! FBO DRAW
  {
    const renderTarget = renderTargets['draw'];
    const { renderNum, textureNum } = fbo.getTargetNum(renderTarget, frameCount);

    uniforms.tDraw.value = renderTarget[renderNum].texture;

    renderer.setViewport(0, 0, renderTarget.width, renderTarget.height);

    renderer.setRenderTarget(renderTarget[textureNum]);
    renderer.render(drawScene, cameraOrthoDraw);
    renderer.setRenderTarget(null);
  }



  //? SCENE
  renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
  renderer.render(scene, camera);


  //? SCENE 2D
  renderer.autoClearColor = false;
  renderer.setViewport(0, 0, 100, 200);
  renderer.render(scene2D, cameraOrthoDraw);

  if (isAssetsLoad) {
    frameCount++;
  }
}


function onResize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = clamp(window.devicePixelRatio, 1, 3);
  renderer.setPixelRatio(pixelRatio); //!!!


  const width = (canvas.clientWidth);
  const height = (canvas.clientHeight);
  renderer.setSize(width, height, false);
  renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
  renderer.render(scene, camera);

  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  uniforms.uResolution.value.x = canvas.clientWidth;
  uniforms.uResolution.value.y = canvas.clientHeight;

  console.log('pixel ratio: [curent, device]', pixelRatio, window.devicePixelRatio);
  console.log('resize', canvas.clientWidth, canvas.clientHeight);
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}




export { update }