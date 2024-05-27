import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import * as dat from 'dat.gui';

const heartURL = new URL('../models/heart.glb', import.meta.url);
const hippoURL = new URL('../models/hippo_sitting.gltf', import.meta.url);

const degreeToRad = Math.PI / 180;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbitControls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const modelLoader = new GLTFLoader();

modelLoader.load(hippoURL.href, function (gltf) {
  const model = gltf.scene;
  // model.position.set(10, 10, 10);
  scene.add(model);
}, undefined, function (error) { console.error(); });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.set(6, 4, -6);
camera.rotation.set(-3, 0, 3);
orbitControls.update();

const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
const torusMaterial = new THREE.MeshBasicMaterial({ color: 0xFF12FF, wireframe: true });
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
scene.add(torus);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambientLight);

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
  cameraSizeZ: 0.0
};

gui.addColor(options, 'torusColor').onChange(function (e) {
  torus.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function (e) {
  torus.material.wireframe = e;
});

gui.add(options, 'speed', 0, 0.1);

gui.add(options, 'cameraX', -10.0, 10.0);

gui.add(options, 'cameraY', -10.0, 10.0);

gui.add(options, 'cameraZ', -10.0, 10.0);

gui.add(options, 'cameraRotX', -180, 180);

gui.add(options, 'cameraRotY', -180, 180);

gui.add(options, 'cameraRotZ', -180, 180);
gui.add(options, 'cameraSizeX', 1, 50);
gui.add(options, 'cameraSizeY', 1, 50);
gui.add(options, 'cameraSizeZ', 1, 50);

function animate() {
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;

  step += options.speed;
  torus.position.y = 10 * Math.abs(Math.sin(step));

  updateCameraDisplay();
  gui.updateDisplay();
  renderer.render(scene, camera);
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

renderer.setAnimationLoop(animate)

