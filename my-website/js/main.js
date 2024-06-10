import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { Water } from 'three/addons/objects/Water2.js';
import { Sky } from 'three/addons/objects/Sky.js';
import * as dat from 'dat.gui';



import road from '../images/Road.png';
import { cameraPosition, materialEmissive } from 'three/examples/jsm/nodes/Nodes.js';

const heartURL = new URL('../models/heart.glb', import.meta.url);
const hippoURL = new URL('../models/hippo_lake.gltf', import.meta.url);
const flowerURL = new URL('../models/flower.glb', import.meta.url);
const flowerSmallURL = new URL('../models/flower_small.glb', import.meta.url);
const treeURL = new URL('../models/tree3.glb', import.meta.url);
const cameraGUI = document.getElementById('cameraPos');

const degreeToRad = Math.PI / 180;


const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(50.00, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(18.91, 6.0972, 6.9632097);
camera.rotation.set(-2.15, 1.35057, 2.1620625);
camera.focus = 10
camera.updateProjectionMatrix();

// const orbitControls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);


renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


// orbitControls.update();

const textureLoader = new THREE.TextureLoader();
textureLoader.load(
  road,
  function (texture) {
    const material = new THREE.MeshStandardMaterial({
      map: texture
    });
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x281219, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3;
    plane.receiveShadow = true;
    scene.add(plane);
  }, undefined, function (err) { console.error('An error happened.'); }
);


const waterGeometry = new THREE.PlaneGeometry(50, 50);

const water = new Water(waterGeometry, {
  color: 0x12aaed,
  scale: 4,
  flowDirection: new THREE.Vector2(1, 1),
  textureWidth: 1024,
  textureHeight: 1024
});

water.position.y = 0.1;
water.rotation.x = Math.PI * -0.5;
scene.add(water);



const modelLoader = new GLTFLoader();
let cam;

modelLoader.load(hippoURL.href, function (gltf) {
  const model = gltf.scene;
  model.position.set(0, 0, -1);
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
    }
  });
  scene.add(model);
}, undefined, function (error) { console.error(); });

function loadFlower(url, x, y, z, color, intensity, emitIntensity) {
  loadPointLight(x, y, z, color, intensity)
  load3DModel(url, x, y, z, emitIntensity, true)
}


function loadPointLight(x, y, z, color, intensity) {
  const pointLightF1 = new THREE.PointLight(color, intensity);
  pointLightF1.position.set(x, y, z);
  pointLightF1.castShadow = true;
  scene.add(pointLightF1);
}

function load3DModel(url, x, y, z, emitIntensity, emissive) {
  modelLoader.load(url.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(x, y, z);
    model.traverse((o) => {
      if (o.isMesh) {
        if (emissive) {
          o.material.emissive = o.material.color;
          o.material.emissiveIntensity = emitIntensity;
        }
        o.castShadow = true;
      }
    });
    scene.add(model);
  }, undefined, function (error) { console.error(); });
}


modelLoader.load(heartURL.href, function (gltf) {
  const model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) {
      o.material.emissive = new THREE.Color(0xE7A2E4);
      o.material.emissiveIntensity = 0.5;
      o.castShadow = true;
    }
  });
  model.position.set(1.6, 2, -2);
  model.castShadow = true;

  scene.add(model);
  animate();
}, undefined, function (error) { console.error(); });


let step = 0;

const options = {
  torusColor: '#ffffff',
  wireframe: true,
  speed: 0.01,

  angle: 0.83,
  penumbra: 0,
  intensity: 3,
  heartAngle: 0
};

// const gui = new dat.GUI();
// gui.add(options, 'angle', 0, 1);
// gui.add(options, 'penumbra', 0, 1);
// gui.add(options, 'intensity', 0, 10);
// gui.add(options, 'heartAngle', 0, 360);

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
  console.log()
  renderComposer.render();
  cameraGUI.innerHTML = `position: ${camera.position.x}, ${camera.position.y}, ${camera.position.z}` + ` rotation: ${camera.rotation.x}, ${camera.rotation.y}, ${camera.rotation.z}` + ` focal: ${camera.focus}` + ` near: ${camera.near} far" ${camera.far}`;
  requestAnimationFrame(animate);
}

function initCameraPos() {
  camera.position.set(18.91, 6.0972, 6.9632097);
  camera.rotation.set(-2.15, 1.35057, 2.1620625);
  camera.focus = 10
}

window.addEventListener("resize", onWindowResize());

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// renderer.setAnimationLoop(animate)

