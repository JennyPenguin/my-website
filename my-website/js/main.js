import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { Water } from 'three/addons/objects/Water2.js';
const heartURL = new URL('../models/heart.glb', import.meta.url);
const hippoURL = new URL('../models/hippo_lake.gltf', import.meta.url);
const cameraGUI = document.getElementById('cameraPos');

const degreeToRad = Math.PI / 180;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});



const camera = new THREE.PerspectiveCamera(50.00, window.innerWidth / window.innerHeight, 0.1, 100);

const modelLoader = new GLTFLoader();

init();


function init() {

  initRenderer();
  initCameraPos();
  initWater();
  initLight();
  loadModels();

}

function initRenderer() {
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

}

function initCameraPos() {
  camera.position.set(16.619, 4.179, 5.491);
  camera.rotation.set(0, 87.86 * degreeToRad, 0);
  camera.updateProjectionMatrix();
}

function initHelpers() {
  // const orbitControls = new OrbitControls(camera, renderer.domElement);
  // const orbitControls = new OrbitControls(camera, renderer.domElement);
  // orbitControls.update();

  // const axesHelper = new THREE.AxesHelper(30);
  // scene.add(axesHelper);

  // const gridHelper = new THREE.GridHelper(30);
  // scene.add(gridHelper);
}

function initWater() {

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
}

function initLight() {
  const direct = new THREE.DirectionalLight(0xFFFFFF, 0.2);
  direct.position.set(5, -1, 3);
  scene.add(direct);
}


const bloomRenderScene = new RenderPass(scene, camera);
const renderComposer = new EffectComposer(renderer);
renderComposer.setSize(window.innerWidth, window.innerHeight);
renderComposer.addPass(bloomRenderScene);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,
  0.1,
  0.1
);
renderComposer.addPass(bloomPass);



function loadModels() {
  modelLoader.load(hippoURL.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0.5, -1);
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
      }
    });
    scene.add(model);
  }, undefined, function (error) { console.error(); });

  modelLoader.load(heartURL.href, function (gltf) {
    const heartModel = gltf.scene;
    heartModel.traverse((o) => {
      if (o.isMesh) {
        o.material.emissive = new THREE.Color(0xE7A2E4);
        o.material.emissiveIntensity = 0.5;
        o.castShadow = true;
      }
    });
    heartModel.position.set(1.287, 2.001, 0);
    const light = new THREE.PointLight(new THREE.Color(0xd79cf7), 2, 15, 0.5);
    light.position.set(1.287, 2.401, 0.421);
    scene.add(light);
    heartModel.castShadow = true;

    scene.add(heartModel);
    animate();
  }, undefined, function (error) { console.error(); });
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



const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) / 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) / 2 + 1;
})


function animate() {
  const heartModel = scene.getObjectByName('heart');
  heartModel.rotation.y += 0.01;

  renderComposer.render();
  cameraGUI.innerHTML = `position: ${camera.position.x}, ${camera.position.y}, ${camera.position.z}` + ` rotation: ${camera.rotation.x}, ${camera.rotation.y}, ${camera.rotation.z}` + ` focal: ${camera.focus}` + ` near: ${camera.near} far" ${camera.far}`;
  requestAnimationFrame(animate);
}


window.addEventListener("resize", onWindowResize());

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// renderer.setAnimationLoop(animate)

