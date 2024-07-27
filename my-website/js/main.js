import * as THREE from 'three';
import gsap from 'gsap';
import { Mesh } from 'three';
import { MeshStandardMaterial } from 'three';
import { Color } from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
const heartURL = new URL('../models/heart.glb', import.meta.url);
const hippoURL = new URL('../models/hippo_lake.glb', import.meta.url);
const mountURL = new URL('../models/mount.glb', import.meta.url);
const underwaterURL = new URL('../models/underwater.glb', import.meta.url);



let heartModel, heartLight;
let initHeartPos = [1.287, 2.451, -2.80];
let pearlAction;
let pearlPlayed = false;

const waterTexture = new URL('../images/waternormals.jpg', import.meta.url);
const cameraGUI = document.getElementById('cameraPos');

const degreeToRad = Math.PI / 180;

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x00010f);

const clock = new THREE.Clock();

let hippoMixer, underwaterMixer;

document.body.scrollY = 0;
let waterBack;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});


const camera = new THREE.PerspectiveCamera(50.00, window.innerWidth / window.innerHeight, 0.1, 100);

const modelLoader = new GLTFLoader();
const textureloader = new THREE.TextureLoader();
let startPos = 5.641;
let endPos = -25;

init();


function init() {

  initRenderer();
  initCameraPos();
  // initHelpers();
  initSky();
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
  camera.position.set(17.273, startPos, 5.114);
  camera.rotation.set(0, 87.86 * degreeToRad, 0);
  camera.updateProjectionMatrix();
}

function initHelpers() {
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.update();

  // const axesHelper = new THREE.AxesHelper(30);
  // scene.add(axesHelper);

  // const gridHelper = new THREE.GridHelper(30);
  // scene.add(gridHelper);
}

function initSky() {
  const skyGeometry = new THREE.SphereGeometry( 30, 35, 35, 0, Math.PI*2, 0, Math.PI/2);
  // const skyTexture = textureloader.load('../images/nightSky downloaded from game asset deals.jpg');
  const skyMaterial = new THREE.MeshBasicMaterial({color:0x000000});
  skyMaterial.side = THREE.DoubleSide;
  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.position.set(-5,0,3);
  // skyMesh.castShadow = true;
  scene.add(skyMesh);
}

function initWater() {

  // const groundGeometry = new THREE.BoxGeometry(100, 100, 20);
  // const groundMaterial = new THREE.MeshStandardMaterial(0x51a3f0);
  // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // ground.position.set(0, -30, 0);
  // ground.rotation.x = Math.PI * -0.5;
  // scene.add(ground);

  const waterGeometry = new THREE.PlaneGeometry(100, 100);
  


  const water = new Water(waterGeometry, {
    color: 0x51a3f0,
    scale: 2,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
    normalMap0: textureloader.load('https://threejs.org/examples/textures/water/Water_1_M_Normal.jpg'),
    normalMap1: textureloader.load('https://threejs.org/examples/textures/water/Water_2_M_Normal.jpg')
  });

  waterBack = new Water(waterGeometry, {
    color: 0xaed4f8,
    scale: 2,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
    normalMap0: textureloader.load('https://threejs.org/examples/textures/water/Water_1_M_Normal.jpg'),
    normalMap1: textureloader.load('https://threejs.org/examples/textures/water/Water_2_M_Normal.jpg')
  });

  waterBack.name = "WaterBack";

  water.position.y = 0.45
  water.rotation.x = Math.PI * -0.5;

  waterBack.position.y = 0.451
  waterBack.rotation.x = Math.PI * 0.5;

  scene.add(water);
}

function animateWater(water) {
  water.material.uniforms['time'].value += 1.0 / 360.0;
}

function initLight() {
  scene.background = new THREE.Color(0x03030f);

  const direct = new THREE.DirectionalLight(0xFFFFFF, 0.2);
  direct.position.set(5, -1, 3);
  scene.add(direct);

  const sky = new THREE.AmbientLight(0xFFFFFF, 0.05);
  scene.add(sky);
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
    model.position.set(0, 1, -3);
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
      }
    });
    hippoMixer = new THREE.AnimationMixer(model);
    // mixer.clipAction(gltf.animations[0]).play();

    const clips = gltf.animations;
    clips.forEach((clip) => hippoMixer.clipAction(clip).play());
    scene.add(model);
  }, undefined, function (error) { console.error(); });

  modelLoader.load(heartURL.href, function (gltf) {
    heartModel = gltf.scene;
    heartModel.traverse((o) => {
      if (o.isMesh) {
        o.material.emissive = new THREE.Color(0xE7A2E4);
        o.material.emissiveIntensity = 0.5;
        o.castShadow = true;
      }
    });
    heartModel.position.set(1.287, 2.401, -2.75);
    heartLight = new THREE.PointLight(new THREE.Color(0xE7A2E4), 1, 15, 0.5);
    heartLight.position.set(1.287, 2.451, -2.80);
    scene.add(heartLight);
    heartModel.castShadow = true;

    scene.add(heartModel);
    animate();
  }, undefined, function (error) { console.error(); });

  modelLoader.load(underwaterURL.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(2, -20, 5);
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
      }
    });
    underwaterMixer = new THREE.AnimationMixer(model);
    underwaterMixer.clipAction(gltf.animations[0]).play();
    underwaterMixer.clipAction(gltf.animations[1]).play();
    pearlAction = gltf.animations;
    scene.add(model);
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






function animate() {
  let time = clock.getDelta();
  if (hippoMixer) {
    hippoMixer.update(time);
  }

  if (underwaterMixer) {
   underwaterMixer.update(time);
  }

  heartModel.rotation.y += 0.01;
  
  if (camera.position.y < 1.04 && !scene.getObjectByName(waterBack.name)) {
    scene.add(waterBack)
  } else if (camera.position.y >= 1.04 && scene.getObjectByName(waterBack.name)) {
    scene.remove(scene.getObjectByName(waterBack.name))
  }

  if (camera.position.y < -5 && !pearlPlayed) {
    for (let i=2; i<pearlAction.length; i++) {
      playOnce(pearlAction[i]);
    }
    // pearlAction.forEach((clip) => playOnce);
    // underwaterMixer.clipAction(gltf.animations[2])
    // pearlAction.clampWhenFinished = true;
    // pearlAction.loop = THREE.LoopOnce;
    // pearlAction.play();
    pearlPlayed = true;
  }



  renderComposer.render();
  // renderer.render(scene, camera);
  cameraGUI.innerHTML = `position: ${camera.position.x}, ${camera.position.y}, ${camera.position.z}` + ` rotation: ${camera.rotation.x}, ${camera.rotation.y}, ${camera.rotation.z}` + ` focal: ${camera.focus}` + ` near: ${camera.near} far" ${camera.far}`;
  requestAnimationFrame(animate);
}

function playOnce(clip) {
    let action = underwaterMixer.clipAction(clip)
    action.clampWhenFinished = true;
    action.loop = THREE.LoopOnce;
    action.play();
}


window.addEventListener("resize", onWindowResize());

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
}



// renderer.setAnimationLoop(animate)


function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.y = startPos + t * 0.01;
  heartModel.position.y = initHeartPos[1] + t * 0.01;
  heartModel.position.x = initHeartPos[0] - t * 0.01;
  heartModel.position.z = initHeartPos[2] - t * 0.01;
  heartLight.position.set(heartModel.position.x, heartModel.position.y, heartModel.position.z);
}

document.body.onscroll = moveCamera;




// const tl = gsap.timeline();

// window.addEventListener('mousedown', function() {
//   tl.to(camera.position, {
//     z: -5,
//     duration: 3,
//     onUpdate: function() {
//       // camera.lookAt(0,0,0);
//     }
//   }).to(camera.position, {
//     y:2, 
//     duration: 3,
//     onUpdate: function() {
//       // camera.lookAt(0,0,0);
//     }
//   }).to(camera.position, {
//     x:0,
//     y:-10,
//     z: 7, 
//     duration: 3,
//     onUpdate: function() {
//       // camera.lookAt(0,0,0);
//     }
//   });

// });

