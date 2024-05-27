import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import * as dat from 'dat.gui';


import starry_back from '../images/Starry.png';
import { materialEmissive } from 'three/examples/jsm/nodes/Nodes.js';

const heartURL = new URL('../models/heart.glb', import.meta.url);
const hippoURL = new URL('../models/hippo_sitting.gltf', import.meta.url);

const degreeToRad = Math.PI / 180;


const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbitControls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);


renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.set(6, 4, -7);
camera.rotation.set(-3, 0, 3);
orbitControls.update();

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(starry_back);
//const cubeTextureLoader = new THREE.CubeTextureLoader();
//scene.background = cubeTextureLoader.load([starry_back, starry_back, starry_back, starry_back, starry_back, starry_back])

const planeGeometry = new THREE.PlaneGeometry(70, 70);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const spotLight = new THREE.SpotLight(0xFFFFFF, 5.3);
spotLight.castShadow = true;
spotLight.angle = 0.7;
scene.add(spotLight);
spotLight.position.set(5, 0, 0);
const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

// scene.fog = new THREE.FogExp2(0xFFFFFF, 0.05);


const modelLoader = new GLTFLoader();


modelLoader.load(hippoURL.href, function (gltf) {
  const model = gltf.scene;
  model.position.set(0, 0.5, -1);
  model.castShadow = true;
  scene.add(model);
}, undefined, function (error) { console.error(); });


modelLoader.load(heartURL.href, function (gltf) {
  const model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) {
      o.material.emissive = new THREE.Color(0xE7A2E4);
      o.material.emissiveIntensity = 0.3;
    }
  });
  model.position.set(1.6, 2, -2);
  model.castShadow = true;
  const axisHelper = new THREE.AxesHelper(1);
  scene.add(axisHelper);
  scene.add(model);
  animate();
}, undefined, function (error) { console.error(); });



const gui = new dat.GUI();

let step = 0;

const options = {
  torusColor: '#ffffff',
  wireframe: true,
  speed: 0.01,
  cameraX: -10.0,
  cameraY: 20.0,
  cameraZ: 30.0,
  cameraRotX: 0.0,
  cameraRotY: 0.0,
  cameraRotZ: 0.0,
  cameraSizeX: 0.0,
  cameraSizeY: 0.0,
  cameraSizeZ: 0.0,
  angle: 0.83,
  penumbra: 0,
  intensity: 3,
  heartAngle: 0
};

gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 10);
gui.add(options, 'heartAngle', 0, 360);

const bloomRenderScene = new RenderPass(scene, camera);
const renderComposer = new EffectComposer(renderer);
renderComposer.addPass(bloomRenderScene);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,
  0.1,
  0.1
);
renderComposer.addPass(bloomPass);

const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) / 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) / 2 + 1;
})

const rayCaster = new THREE.Raycaster();
const directionalL = new THREE.DirectionalLight(0xFFFFFF, 0.1);
scene.add(directionalL);


function animate() {
  const heartModel = scene.getObjectByName('heart');
  heartModel.rotation.y += 0.01;

  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);
  console.log(intersects);
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id === heartModel.id) {
      intersects[i].object.material.color.set(0xf0c6ee);
    }
  }

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  sLightHelper.update();
  gui.updateDisplay();

  renderComposer.render();

  requestAnimationFrame(animate);
}


function setCameraDisplay() {
  gui.add(options, 'cameraX', -10.0, 10.0);
  gui.add(options, 'cameraY', -10.0, 10.0);
  gui.add(options, 'cameraZ', -10.0, 10.0);
  gui.add(options, 'cameraRotX', -180, 180);
  gui.add(options, 'cameraRotY', -180, 180);
  gui.add(options, 'cameraRotZ', -180, 180);
  gui.add(options, 'cameraSizeX', 1, 50);
  gui.add(options, 'cameraSizeY', 1, 50);
  gui.add(options, 'cameraSizeZ', 1, 50);
}

function updateCameraDisplay() {
  // camera.rotation.y = 0;
  options.cameraX = camera.position.x;
  options.cameraY = camera.position.y;
  options.cameraZ = camera.position.z;
  options.cameraRotX = camera.rotation.x;
  options.cameraRotY = camera.rotation.y;
  options.cameraRotZ = camera.rotation.z;
  options.cameraSizeX = camera.scale.x;
  options.cameraSizeY = camera.scale.y;
  options.cameraSizeZ = camera.scale.z;
}

// renderer.setAnimationLoop(animate)

