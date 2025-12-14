import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x222831)
const canvas = document.querySelector('#webgl');

const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,100);
camera.position.set(0,0,2.4);

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

//----Helping Func---
// Toggle Function
function toggleState (btn,onActive,onInactive){
  const isActive = btn.dataset.active ==='true';
  btn.dataset.active = !isActive;
  !isActive ? onActive() : onInactive();
}
// Get Contrast Color
function getContrastColor(hex){
  hex = hex.replace('#','');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  //Lighting formula 
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000; 
  return (yiq >= 128) ? 'black' : 'white';
}
// Get Random Color
let isRandomBrushMode = true;
function getRandomColor(){
  const letters = '0123456789ABCDEF';
  let color = '#';
  for(let i = 0; i<6 ; i++){
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

//---Footer Btn Logic
//logic Run Animation
const btnAnimation = document.querySelector("#animation");
btnAnimation.addEventListener("click",function(){
  toggleState(this,
    ()=>{
      action.reset().fadeIn(1.2).play();
    },
    ()=>{
      action.fadeOut(1);
    }
  )
})

// Hide * show Human
const btnHuman = document.querySelector("#human");
btnHuman.addEventListener('click',function(){
  toggleState(this,
    ()=>{   
      tShrit.children[0].children[0].visible = true;
      camera.position.set(0,0,6.2);
      tShrit.position.y = -3
    },
    ()=>{
      tShrit.children[0].children[0].visible = false;
      camera.position.set(0,0,2.4);
      tShrit.position.y = -3.5
    }
  )
})

//Take a Shot
const btnShot = document.querySelector("#shot");
btnShot.addEventListener('click',()=>{
  alert("soon");
})

//-----Dark Theme
const darkModeBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

darkModeBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

//-----Tools Bar-------------
//undo
const undoBtn = document.getElementById("undoBTN");
//redo
const redoBtn = document.getElementById("redoBTN");
//zoom in
const zoomInBtn = document.getElementById("zoomInBTN");
//zoom out
const zoomOutBtn = document.getElementById("zoomOutBTN");
//lock
const lockBtn = document.getElementById("lockBTN");
lockBtn.addEventListener("click",function(){
  toggleState(this,
    ()=>{
      controls.enabled = false;
    },
    ()=>{
       controls.enabled = true;
    }
  )
})
//trash
const trashBtn = document.getElementById("trashBTN");



//----System Color ----
// get Human Color 
const allHumanColorBtn = document.querySelectorAll(".humanColorBtn .color-swatch")
let currentHumanColor = 0x000000;
allHumanColorBtn.forEach(btn =>{
  btn.addEventListener('click',(e)=>{
    const clickedBtn = e.currentTarget;
    //delete all active
    allHumanColorBtn.forEach(otherBtn=>{
      otherBtn.removeAttribute('data-active');
    });
    //set active
    clickedBtn.setAttribute('data-active', 'true');
    //get color
    const colorValue = clickedBtn.getAttribute('data-color');
    currentHumanColor = colorValue;
    //change human color
    if(humanMat){humanMat.color.set(currentHumanColor);}
  })
})

//get T-shirt Color
const allTShirtColorBtn = document.querySelectorAll(".t-shirtColorBtn .color-swatch")
let currentTShirtColor = 0xFFFFFF;
allTShirtColorBtn.forEach(btn =>{
  btn.addEventListener('click',(e)=>{
    const clickedBtn = e.currentTarget;
    //delete all active
    allTShirtColorBtn.forEach(otherBtn=>{
      otherBtn.removeAttribute('data-active');
    });
    //set active
    clickedBtn.setAttribute('data-active', 'true');
    //get color
    const colorValue = clickedBtn.getAttribute('data-color');
    currentTShirtColor = colorValue;
    //change t-shirt color
    if(shirtMat){shirtMat.color.set(currentTShirtColor);}
  })
})

//get custom t-shirt color 
const customTShirtColorInput = document.getElementById('custom-tshirt-picker');
const customTShirtColorLabal = document.querySelector('label[for="custom-tshirt-picker"]');
customTShirtColorInput.addEventListener('input',(e)=>{
  const newColor = e.target.value;
  currentTShirtColor = newColor;
  customTShirtColorLabal.style.backgroundColor = newColor;

  const contrast = getContrastColor(newColor);
  const svgIcon = customTShirtColorLabal.querySelector('svg');
  if(contrast === 'white'){
    svgIcon.style.filter = 'invert(1)';
  }else{
    svgIcon.style.filter = 'none';
  }

  allTShirtColorBtn.forEach(btn=>{btn.removeAttribute('data-avtive');});
  customTShirtColorLabal.setAttribute('data-active','true');
  //change t-shirt color
  if(shirtMat){shirtMat.color.set(currentTShirtColor);}
})
//-- Brush Setting
//brush size 
const brushSizeInput = document.getElementById('brush-size');
const brushSizeDisplay = document.getElementById('brush-size-display');
brushSizeInput.addEventListener('input',(e)=>{
  const newSize = e.target.value;
  brushSizeDisplay.innerHTML = newSize+"px";
})
//get brush color 
const allBrushColorBtn = document.querySelectorAll(".brushColorBtn .color-swatch")
let currentBrushColor = 0xFFFFFF;
allBrushColorBtn.forEach(btn =>{
  btn.addEventListener('click',(e)=>{
    const clickedBtn = e.currentTarget;
    //delete all active
    allBrushColorBtn.forEach(otherBtn=>{
      otherBtn.removeAttribute('data-active');
    });
    //set active
    clickedBtn.setAttribute('data-active', 'true');
    //get color
    const colorValue = clickedBtn.getAttribute('data-color');
    if(colorValue ==='random'){
      isRandomBrushMode = true;
    }else{
      isRandomBrushMode = false;
      currentBrushColor = colorValue;
    }
  })
})
//get custom brush color 
const customBrushColorInput = document.getElementById('custom-brush-picker');
const customBrushColorLabal = document.querySelector('label[for="custom-brush-picker"]');
customBrushColorInput.addEventListener('input',(e)=>{
  const newColor = e.target.value;
  currentBrushColor = newColor;
  customBrushColorLabal.style.backgroundColor = newColor;

  const contrast = getContrastColor(newColor);
  const svgIcon = customBrushColorLabal.querySelector('svg');
  if(contrast === 'white'){
    svgIcon.style.filter = 'invert(1)';
  }else{
    svgIcon.style.filter = 'none';
  }
  isRandomBrushMode = false;
  allBrushColorBtn.forEach(btn=>{btn.removeAttribute('data-avtive');});
  customBrushColorLabal.setAttribute('data-active','true');
})
//----------------------------Three js-------------------------
//Lighting
const ambLight = new THREE.AmbientLight('#ffffff',0.8);
scene.add(ambLight);

const dirLight = new THREE.DirectionalLight('#ffffff',1);
dirLight.position.set(2,2,2);
scene.add(dirLight);

//GltfLoader
const gltfLoader = new GLTFLoader();

let tShrit,shirtMesh,shirtMat,humanMat;
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
  shirtMesh = tShrit.children[0].children[1]
  shirtMat = shirtMesh.material;
  humanMat = tShrit.children[0].children[0].material;
  tShrit.children[0].children[0].visible = false;

  //color system
  shirtMat.color.set(currentTShirtColor);
  humanMat.color.set(currentHumanColor);
  
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
