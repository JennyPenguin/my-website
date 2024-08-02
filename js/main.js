import * as THREE from "../node_modules/three/build/three.module.js";
import gsap from 'gsap';
import { GLTFLoader, OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
//import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js';

window.scrollTo(0, 0);

const heartURL = new URL('../models/heart.glb', import.meta.url);
const hippoURL = new URL('../models/hippo_lake.glb', import.meta.url);
const waterURL = new URL('../images/Water_pattern.png', import.meta.url);
const underwaterURL = new URL('../models/underwater.glb', import.meta.url);
const caveURL = new URL('../models/cave.glb', import.meta.url);
const waterNormalURL = new URL('../images/Water_1_M_Normal.jpg', import.meta.url);
const cloudURL = new URL('../images/Cloud_Pattern.png', import.meta.url);
const cloudURL2 = new URL('../images/Cloud_Pattern2.png', import.meta.url);
const cloudURL3 = new URL('../images/Cloud_Pattern3.png', import.meta.url);
const skyURL= new URL('../images/SkyTexture.png', import.meta.url);

// 7 is web, 6 is others, 4 is pong, 3 is vr, 2 is cmu, 1 is unity
const mapBubblePos = {'7': [3.8,-12,-1.5], '6':[1,-7.8,-2.6], '4': [-2.2, -5.5, 0], '3':[4.5, -9, 8], '2':[-2.2,-5.8,5.5], '1':[4,-10,3.5]}
const mapBubbleName = {'7': "web", '6':"others", '4': "pong", '3':"vr", '2':"education", '1':"unity"}
let pageChoice = "-1"; 

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg'),
});
const tl = gsap.timeline();
const camera = new THREE.PerspectiveCamera(50.00, window.innerWidth / window.innerHeight, 0.1, 100);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const loadingManager = new THREE.LoadingManager();
const textureloader = new THREE.TextureLoader(loadingManager);
const modelLoader = new GLTFLoader(loadingManager);

const progressBar = document.getElementById('progress-bar');
const loadingScreen = document.getElementById('loadingScreen');
const times = document.getElementById("timeline").childNodes;
const dotButtons = document.getElementsByClassName("dotButton");
const viewBubblesWarning = document.getElementById("viewBubblesText");
const main = document.getElementById("main");

let prevScroll;

loadingManager.onProgress = function(url, loaded, total) {
  progressBar.value = (loaded / total) + 100;
}

loadingManager.onLoad = function() {
  loadingScreen.style.display = "none";
}

const degreeToRad = Math.PI / 180;

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x00010f);

const clock = new THREE.Clock();

let hippoMixer, underwaterMixer;





document.body.scrollY = 0;
let waterBack;
let heartModel, heartLight;
let initHeartPos = [1.287, 2.451, -2.80];
let pearlAction, oceanBlueLight, oceanBlueLight2;
let pearlPlayed = false;
let skyMesh, waterSpotLight, waterSpotLight2;
let clouds = [];
const gradientSkyTexture = textureloader.load(skyURL);


let startPos = 5.641;
let endPos = -25;

init();

function init() {
  initRenderer();
  initCameraPos();
  initSky();
  initWater();
  initLight();
  initClouds();
  loadModels();
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
  const skyMaterial = new THREE.MeshBasicMaterial({color:0x000000});
  skyMaterial.side = THREE.DoubleSide;
  skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.position.set(-5,0,3);
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
    normalMap0: textureloader.load(waterNormalURL),
    normalMap1: textureloader.load(waterNormalURL)
  });

  waterBack = new Water(waterGeometry, {
    color: 0x9cdae5,
    scale: 2,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
    normalMap0: textureloader.load(waterNormalURL),
    normalMap1: textureloader.load(waterNormalURL)
  });

  waterBack.name = "waterBack";

  water.position.y = 0.45
  water.rotation.x = Math.PI * -0.5;

  waterBack.position.y = 0.451;
  waterBack.rotation.x = Math.PI * 0.5;

  scene.add(water);
}

function initUnderwaterDynamics() {
	const texture = textureloader.load(waterURL );
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.colorSpace = THREE.SRGBColorSpace;

	waterSpotLight = new THREE.SpotLight( 0xffffff, 30);
	waterSpotLight.position.set( -4,0,  -10);
        
				waterSpotLight.angle = Math.PI/4;
				waterSpotLight.penumbra = 0.5;
				waterSpotLight.decay = 1;
				waterSpotLight.distance = 70;
				waterSpotLight.map = texture;

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
				waterSpotLight2.map = texture;

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
  // for some reason, code stops working if removed oceanBlueLight
  oceanBlueLight = new THREE.AmbientLight(0x04468e, 1);
  oceanBlueLight2 = new THREE.AmbientLight(0xffffff, 0.2);
  oceanBlueLight2.position.set(0,-10,0);
  // scene.add(oceanBlueLight);
  initUnderwaterDynamics();

  const pointPink = new THREE.PointLight(0xfcb9c4, 1, 20, 1);
  pointPink.position.set(0, -35, 0);
  scene.add(pointPink);

  const pointDarkPink = new THREE.PointLight(0xdf00a3, 1, 30, 1);
  pointDarkPink.position.set(3, -36, 8);
  scene.add(pointDarkPink);
}

function initClouds() {
  const cloudTextures = [textureloader.load(cloudURL), textureloader.load(cloudURL2), textureloader.load(cloudURL3)];
  const cloudGeo = new THREE.PlaneGeometry(18,18);
  const cloudMats = [new THREE.MeshLambertMaterial({
    color: 0xFFFFFFF,
    map: cloudTextures[0],
    blending: THREE.NormalBlending,
    transparent:true
  }), new THREE.MeshLambertMaterial({
    color: 0xFFFFFFF,
    map: cloudTextures[1],
    blending: THREE.NormalBlending,
    transparent:true
  }), new THREE.MeshLambertMaterial({
    color: 0xFFFFFFF,
    map: cloudTextures[2],
    blending: THREE.NormalBlending,
    transparent:true
  })]

  for (let c=0; c<30; c++) {
    const cloud = new THREE.Mesh(cloudGeo, cloudMats[c % 3]);
    cloud.material.opacity = 0.4;
    cloud.position.set(-20 + Math.random()*12 ,-24 - Math.random() * 28, -30 + Math.random() * 60);
    // cloud.position.set(-, -35, 5);
    cloud.rotation.y = 90 * degreeToRad;
    clouds.push(cloud);
    scene.add(cloud);
  }
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
    scene.add(model);
  }, undefined, function (error) { console.error(); });

  modelLoader.load(caveURL.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, -35.26, 8.7);
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow= true;
      }
    });
    
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

  clouds.forEach(p => {
    p.rotation.z -= 0.001;
  })

	waterSpotLight.position.x = Math.cos( timer ) * 2.5;
	waterSpotLight.position.z = Math.sin( timer ) * 2.5;

  waterSpotLight2.position.x = Math.cos( timer ) * 2.5;
	waterSpotLight2.position.z = Math.sin( timer ) * 2.5;

  heartModel.rotation.y += 0.01;
if (camera.position.y < -20.874) {
  scene.background = new THREE.Color( 0x2058ab);
  scene.remove(waterBack);
  times[5].classList.add("activeTime");
  times[3].classList.remove("activeTime");
}
else if (camera.position.y < 0.55 && !scene.getObjectByName(waterBack.name)) {
    scene.fog = new THREE.FogExp2( 0x51a3f0, 0.001 );
    scene.add(waterBack)
    scene.remove(skyMesh);
    scene.add(oceanBlueLight2);
    scene.background = new THREE.Color( 0x1d519c);
    times[5].classList.remove("activeTime");
    times[3].classList.add("activeTime");
    times[1].classList.remove("activeTime");
  } else if (camera.position.y >= 0.55 && scene.getObjectByName(waterBack.name)) {
    scene.fog.emissiveIntensity = 0;
    scene.fog = new THREE.Fog( 0x000000, 26, 30 );
    scene.remove(waterBack);
    scene.add(skyMesh);
    scene.remove(oceanBlueLight2);
    scene.background = new THREE.Color( 0x00010f);
    times[1].classList.add("activeTime");
    times[3].classList.remove("activeTime");
  } 

  if (camera.position.y < -2 && !pearlPlayed) {
    for (let i=2; i<pearlAction.length; i++) {
      playOnce(pearlAction[i]);
    }
    pearlPlayed = true;
    viewBubblesWarning.classList.remove("noView");
    viewBubblesWarning.classList.add("fadeIn");
  }

  window.addEventListener("resize", onWindowResize, false);
  renderComposer.render();
  // renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function playOnce(clip) {
    let action = underwaterMixer.clipAction(clip)
    action.clampWhenFinished = true;
    action.loop = THREE.LoopOnce;
    action.play();
}




function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  const scrollPct = window.scrollY / (4800 - window.innerHeight);
  // console.log(`${window.scrollY} ${window.height} `);
  camera.position.y = startPos + scrollPct * -40;
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
    const bubbleName = intersects[ i ].object.name;
		if (bubbleName.substring(0, 6) == "bubble" && pageChoice == "-1") {
      pageChoice = bubbleName.substr(-1)
      zoomTo(mapBubblePos[pageChoice]);
    }

	}

	renderer.render( scene, camera );

}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener( 'click', render );

function zoomTo(pos) {
  hideTimeLine();
  tl.to(camera.position, {
    x: pos[0],
    y: pos[1],
    z: pos[2],
    duration: 2,
    onComplete: show
  })
}

function noAction() {}


function show() {
  document.body.onscroll = noAction;
  prevScroll = window.scrollY;
  main.classList.add("noView");
  const page = document.getElementById(mapBubbleName[pageChoice]);
  const backB = document.getElementById('backButton');
  page.classList.remove("noView");
  page.classList.add("fadeIn");
  page.classList.remove("fadeOut");
  backB.classList.remove("noView");
  backB.classList.add("fadeIn");
  backB.classList.remove("fadeOut");
}

function back() {
  document.body.onscroll = moveCamera;
  main.classList.remove("noView");
  const page = document.getElementById(mapBubbleName[pageChoice]);
  window.scrollTo(0, prevScroll);
  const backB = document.getElementById('backButton');
  page.classList.add("noView");
  page.classList.add("fadeOut");
  page.classList.remove("fadeIn");
  backB.classList.add("noView");
  backB.classList.remove("fadeIn");
  backB.classList.add("fadeOut");
  pageChoice = "-1";
  returnOceanCam();
}

function returnOceanCam() {
  // console.log(window.scrollY);
  tl.to(camera.position, {
    x: 17.273,
    y: -9,
    z:  5.114,
    duration: 2,
    onComplete: showTimeLine
  })
}

let timePosMap = {1: startPos, 3:-9, 5:startPos-40};
let timeScrollMap = {1: 0, 3:1586.6, 5:3976};

function moveTo(timeChoice) {
  hideTimeLine();
  main.classList.add("noView");
  tl.to(camera.position, {
    y: timePosMap[timeChoice],
    duration: 0.5,
    onComplete: transition,
    onCompleteParams:[timeScrollMap[timeChoice]]
  })
  for (let i=1; i<=5; i+=2) {
    if (i != timeChoice) {
      times[i].classList.remove("activeTime");
    } else {
      times[i].classList.add("activeTime");
    }
  }  
}

function transition(scrollAmount) {
  showTimeLine();
  main.classList.remove("noView");
  window.scrollTo(0, scrollAmount);
}

function showTimeLine() {
  document.getElementById("timeline").style.display = "flex";
  document.getElementById("vertLine").style.display = "inline";
}

function hideTimeLine() {
  document.getElementById("timeline").style.display = "none";
  document.getElementById("vertLine").style.display = "none";
}

document.getElementById('backButton').onclick = function() {
 back();
};

document.getElementById("introButton").onclick = function() {
  moveTo(1);
};

document.getElementById("projectButton").onclick = function() {
  moveTo(3);
};

document.getElementById("contactButton").onclick = function() {
  moveTo(5);
};




