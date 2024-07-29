import * as THREE from "../node_modules/three/build/three.module.js"
import gsap from 'gsap';
import { GLTFLoader, OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
const heartURL = new URL('../models/heart.glb', import.meta.url);
const hippoURL = new URL('../models/hippo_lake.glb', import.meta.url);
const mountURL = new URL('../models/mount.glb', import.meta.url);
const underwaterURL = new URL('../models/underwater.glb', import.meta.url);
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js';

let skyMesh, waterSpotLight, waterSpotLight2;

window.addEventListener('mouseup', function() {
  console.log(camera.position);
})

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let heartModel, heartLight;
let initHeartPos = [1.287, 2.451, -2.80];
let pearlAction, oceanBlueLight, oceanBlueLight2;
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
// const fpc = new FirstPersonControls(camera, renderer.domElement);
// fpc.movementSpeed = 8;
// fpc.lookSpeed = 0.08;

const modelLoader = new GLTFLoader();
const textureloader = new THREE.TextureLoader();
let startPos = 5.641;
let endPos = -25;

init();


function init() {

  initRenderer();
  initCameraPos();
  initSky();
  initWater();
  initLight();
   initUnderwaterDynamics();
  loadModels();
  const axisH = new THREE.AxesHelper();
  scene.add(axisH);
}

function initRenderer() {
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
}

function initCameraPos() {
  camera.position.set(17.273, startPos, 5.114);
  camera.rotation.set(0, 87.86 * degreeToRad, 0);
  camera.updateProjectionMatrix();
}

function initSky() {
  const skyGeometry = new THREE.SphereGeometry( 30, 35, 35, 0, Math.PI*2, 0, Math.PI/2);
  // const skyTexture = textureloader.load('../images/nightSky downloaded from game asset deals.jpg');
  const skyMaterial = new THREE.MeshBasicMaterial({color:0x000000});
  skyMaterial.side = THREE.DoubleSide;
  skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.position.set(-5,0,3);

  // skyMesh.castShadow = true;
  scene.add(skyMesh);
}

function initWater() {
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
    color: 0x9cdae5,
    scale: 2,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
    normalMap0: textureloader.load('https://threejs.org/examples/textures/water/Water_1_M_Normal.jpg'),
    normalMap1: textureloader.load('https://threejs.org/examples/textures/water/Water_2_M_Normal.jpg')
  });

  waterBack.name = "waterBack";



  water.position.y = 0.45
  water.rotation.x = Math.PI * -0.5;

  waterBack.position.y = 0.451;
  waterBack.rotation.x = Math.PI * 0.5;
  // water.position.x = 7.5;

  scene.add(water);
}

function initUnderwaterDynamics() {
  // code from three.js examples
  const filenames = [ 'Water_pattern.png'];

				const textures = { none: null };

				for ( let i = 0; i < filenames.length; i ++ ) {

					const filename = filenames[ i ];

					const texture = textureloader.load(new URL('../images/' + filename, import.meta.url)  );
					texture.minFilter = THREE.LinearFilter;
					texture.magFilter = THREE.LinearFilter;
					texture.colorSpace = THREE.SRGBColorSpace;

					textures[ filename ] = texture;

				}

				waterSpotLight = new THREE.SpotLight( 0xffffff, 30);
				waterSpotLight.position.set( -4,0,  -10);
        
				waterSpotLight.angle = Math.PI/4;
				waterSpotLight.penumbra = 0.5;
				waterSpotLight.decay = 1;
				waterSpotLight.distance = 50;
				waterSpotLight.map = textures[  'Water_pattern.png'];

				waterSpotLight.castShadow = true;
				waterSpotLight.shadow.mapSize.width = 1024;
				waterSpotLight.shadow.mapSize.height = 1024;
				waterSpotLight.shadow.camera.near = 1;
				waterSpotLight.shadow.camera.far = 10;
				waterSpotLight.shadow.focus = 1;
				

        const targetObject = new THREE.Object3D(); 
        targetObject.position.set(-3, -18, -10);
        scene.add(targetObject);

        waterSpotLight.target = targetObject;
        scene.add( waterSpotLight );

        // secpmd pme

        waterSpotLight2 = new THREE.SpotLight( 0xffffff, 40);
        
				waterSpotLight2.angle = Math.PI/3.5;
				waterSpotLight2.penumbra = 0.5;
				waterSpotLight2.decay = 1;
				waterSpotLight2.distance = 70;
				waterSpotLight2.map = textures[  'Water_pattern.png'];

				waterSpotLight2.castShadow = true;
				waterSpotLight2.shadow.mapSize.width = 1024;
				waterSpotLight2.shadow.mapSize.height = 1024;
				waterSpotLight2.shadow.camera.near = 1;
				waterSpotLight2.shadow.camera.far = 10;
				waterSpotLight2.shadow.focus = 1;
        waterSpotLight2.position.set(-2, 0, 18);

        const targetObject2 = new THREE.Object3D(); 
        targetObject2.position.set(-3, -18, 20);
        waterSpotLight2.target = targetObject2;
        scene.add(targetObject2);
        scene.add(waterSpotLight2);
}

function initLight() {
  scene.background = new THREE.Color(0x03030f);

  const direct = new THREE.DirectionalLight(0xFFFFFF, 0.2);
  direct.position.set(5, -1, 3);
  scene.add(direct);

  const sky = new THREE.AmbientLight(0xFFFFFF, 0.05);
  scene.add(sky);

  oceanBlueLight = new THREE.AmbientLight(0x04468e, 1);
  oceanBlueLight = new THREE.PointLight(0x000000, 1, 30);
  oceanBlueLight2 = new THREE.AmbientLight(0xffffff, 0.8);
  oceanBlueLight.position.set(0,-10,0);
  oceanBlueLight2.position.set(0,-10,0);

}

function initBloom() {
  
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
        o.castShadow= true;
      }
    });
    hippoMixer = new THREE.AnimationMixer(model);
    // waterSpotLight.target = model;
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
        o.receiveShadow = true;
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
    model.position.set(2, -17.5, 5);
    model.traverse((o) => {
      if (o.isMesh) {
        o.receiveShadow = true;
      }
    });
    underwaterMixer = new THREE.AnimationMixer(model);
    underwaterMixer.clipAction(gltf.animations[0]).play();
    underwaterMixer.clipAction(gltf.animations[1]).play();
    pearlAction = gltf.animations;
    // waterSpotLight.target = model;
    scene.add(model);
  }, undefined, function (error) { console.error(); });
}

function animate() {

  let time = clock.getDelta();
  // fpc.update(time);
  if (hippoMixer) {
    hippoMixer.update(time);
  }

  if (underwaterMixer) {
   underwaterMixer.update(time);
  }

  const timer = performance.now() / 3000;

	waterSpotLight.position.x = Math.cos( timer ) * 2.5;
	waterSpotLight.position.z = Math.sin( timer ) * 2.5;

  waterSpotLight2.position.x = Math.cos( timer ) * 2.5;
	waterSpotLight2.position.z = Math.sin( timer ) * 2.5;

  heartModel.rotation.y += 0.01;
  
  if (camera.position.y < 0.55 && !scene.getObjectByName(waterBack.name)) {
    scene.fog = new THREE.FogExp2( 0x51a3f0, 0.005 );
    scene.add(waterBack)
    scene.remove(skyMesh);
    // scene.add(oceanBlueLight2);
    scene.background = new THREE.Color( 0x1d519c);
  } else if (camera.position.y >= 0.55 && scene.getObjectByName(waterBack.name)) {
    scene.fog.emissiveIntensity = 0;
    scene.fog = new THREE.Fog( 0x000000, 26, 30 );
    scene.remove(waterBack);
    scene.add(skyMesh);
    // scene.remove(oceanBlueLight2);
    scene.background = new THREE.Color( 0x00010f);
  }

  if (camera.position.y < -2 && !pearlPlayed) {
    for (let i=2; i<pearlAction.length; i++) {
      playOnce(pearlAction[i]);
    }
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

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.y = startPos + t * 0.01;
  heartModel.position.y = initHeartPos[1] + t * 0.01;
  heartModel.position.x = initHeartPos[0] - t * 0.01;
  heartModel.position.z = initHeartPos[2] - t * 0.01;
  heartLight.position.set(heartModel.position.x, heartModel.position.y, heartModel.position.z);
}

document.body.onscroll = moveCamera;

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


function render() {

	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );

	for ( let i = 0; i < intersects.length; i ++ ) {

		if (intersects[ i ].object.name.substring(0, 6) == "bubble") {
      zoomTo(intersects[ i ].object);
    }

	}

	renderer.render( scene, camera );

}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener( 'click', render );

function zoomTo(object) {
  const tl = gsap.timeline();
  const pos = object.position;
  tl.to(camera.position, {
    x: 4.5,
    y: -9,
    z: 8,
    duration: 2,
    onComplete: show
  })
}

function show() {
  document.getElementById("vr").classList.remove("noView");
  document.getElementById("vr").classList.add("fadeIn");
}



