import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x222831)
const canvas = document.querySelector('#webgl');

const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,100);
camera.position.set(0,0,2);

const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  antialias:true,
  alpha:true
});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera,canvas);
controls.enableDamping = true;


window.addEventListener('resize',() => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  const responsiveResize = getResponsiveData();
  const tShritScale = responsiveResize.modelScale;
  tShrit.scale.set(tShritScale,tShritScale,tShritScale);
})

//--------------------------- JS ------------------------------
// Manage Responsive 
function getResponsiveData(){
  const width = window.innerWidth;
  const isMobile = width <= 450;
  return{
    particleCount: isMobile ? 20 : 40,
    modelScale : isMobile ? 1.5 : 3,
    brushSizeDefault : isMobile ? 15 : 30,
    fpsTarget : isMobile ? 30 : 60
  }
}
const responsive = getResponsiveData();

//Handel Animation
const btnAnimation = document.querySelector("#animation");
const btnState = {
  isRunning :false,
  toggle(){
    const isActive = btnAnimation.getAttribute('data-active') === 'true';
    if(isActive){
      btnAnimation.setAttribute('data-active','false')
      action.fadeOut(1); 
    }else{
      btnAnimation.setAttribute('data-active', 'true');
      action.reset().fadeIn(1.2).play()
    }
  }
}
btnAnimation.addEventListener('click',()=>{btnState.toggle()});

//Dark Theme
const toggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

toggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});


//----------------------------Three js-------------------------
//Lighting
const ambLight = new THREE.AmbientLight('#ffffff',0.8);
scene.add(ambLight);

const dirLight = new THREE.DirectionalLight('#ffffff',1);
dirLight.position.set(2,2,2);
scene.add(dirLight);

//GltfLoader
const gltfLoader = new GLTFLoader();

let tShrit;
let mixer,action;
gltfLoader.load("model/t-shirt.glb",(gltf)=>{
  tShrit = gltf.scene;

  //Scale manegment
  const tShritScale = responsive.modelScale;
  tShrit.scale.set(tShritScale,tShritScale,tShritScale);

  //Center 
  tShrit.position.y = -3.5

  //animation
   mixer = new THREE.AnimationMixer(tShrit);
  const clip = gltf.animations[1];
  action = mixer.clipAction(clip);

  //Acsess To Material
  const shirtMat = tShrit.children[0].children[1].material;
  const humanMat = tShrit.children[0].children[0].material;
  tShrit.children[0].children[0].visible = false;

  //shirtMat.color.setHex(0xFF0000);
  //humanMat.color.setHex(0x00ADB5);
  
  //Add to scene % log
  scene.add(tShrit);
  console.log(gltf)
})




//-------------------------------------------------------------
const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();


  if(mixer){
    mixer.update(delta);
  }

  controls.update();
  renderer.render(scene,camera);
}
animate()
