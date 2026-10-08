import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x070807);


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.01,
  200
);


// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;


const sceneContainer = document.getElementById("scene");

if (!sceneContainer) {
  throw new Error('Не найден <main id="scene"></main>');
}

sceneContainer.appendChild(renderer.domElement);


// ============================================================
// CONTROLS
// ============================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;


// ============================================================
// LIGHTING
// ============================================================

scene.add(new THREE.HemisphereLight(0xffffff, 0x151515, 2.0));

const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(5, 10, 8);
keyLight.castShadow = true;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x8fb8ff, 1.1);
rimLight.position.set(-8, 5, -5);
scene.add(rimLight);


// ============================================================
// MODEL
// ============================================================

const loader = new GLTFLoader();
let model = null;


// ============================================================
// STATE
// ============================================================

let selectedDisk = null;
let hoveredDisk = null;

let mode = "intro";
let animationStart = 0;
let homeCamera = null;


// ============================================================
// INTRO CAMERA
// ============================================================

let introAnimationStart = 0;
let introCenter = null;
let introDistance = 0;


// ============================================================
// UI FADE
// ============================================================

let uiOpacity = 0;
let uiElements = [];


// ============================================================
// FLOPPY DISKS
// ============================================================

const diskNames = [
  "floppy-yellow",
  "floppy-white",
  "floppy-pink",
  "floppy-green",
  "floppy-blue",
  "floppy-black"
];


const diskLabels = {
  "floppy-yellow": "ABOUT",
  "floppy-white":  "PROJECTS",
  "floppy-pink":   "MUSIC",
  "floppy-green":  "CONTACT",
  "floppy-blue":   "GAMES",
  "floppy-black":  "SYSTEM"
};


// ============================================================
// SCREEN CONTENT
// ============================================================

const content = {

  ABOUT: `
    <div class="terminal">
      <div class="title">A:\\ABOUT.TXT</div>
      <p>&gt; Nikita</p>
      <p>&gt; Developer</p>
      <p>&gt; Web / Linux / 3D</p>
      <br>
      <p>&gt; Welcome.</p>
    </div>
  `,

  PROJECTS: `
    <div class="terminal">
      <div class="title">A:\\PROJECTS</div>
      <p>&gt; MY WEBSITE</p>
      <p>&gt; BLENDER EXPERIMENTS</p>
      <p>&gt; HOME SERVER</p>
      <p>&gt; LOCAL AI</p>
    </div>
  `,

  MUSIC: `
    <div class="terminal">
      <div class="title">A:\\MUSIC</div>
      <p>&gt; AUDIO PLAYER</p>
      <p>&gt; [ PLAY ]</p>
    </div>
  `,

  CONTACT: `
    <div class="terminal">
      <div class="title">A:\\CONTACT</div>
      <p>&gt; GitHub</p>
      <p>&gt; Telegram</p>
      <p>&gt; Email</p>
    </div>
  `,

  GAMES: `
    <div class="terminal">
      <div class="title">A:\\GAMES</div>
      <p>&gt; STEAM</p>
      <p>&gt; CHESS</p>
      <p>&gt; OTHER PROJECTS</p>
    </div>
  `,

  SYSTEM: `
    <div class="terminal">
      <div class="title">A:\\SYSTEM</div>
      <p>&gt; CPU: ONLINE</p>
      <p>&gt; MEMORY: OK</p>
      <p>&gt; FLOPPY: READY</p>
      <p>&gt; STATUS: 200 OK</p>
    </div>
  `

};


// ============================================================
// DOM
// ============================================================

const labelsRoot     = document.getElementById("diskLabels");
const labelEls       = new Map();
const loading        = document.getElementById("loading");
const intro          = document.getElementById("intro");
const header         = document.querySelector(".site-header");
const carouselHint   = document.querySelector(".carousel-hint");
const screenUI       = document.getElementById("screenUI");
const screenContent  = document.getElementById("screenContent");
const closeScreen    = document.getElementById("closeScreen");


// ============================================================
// UI FADE HELPERS
// ============================================================

function collectUIElements() {

  uiElements = [];

  if (intro)        uiElements.push(intro);
  if (header)       uiElements.push(header);
  if (carouselHint) uiElements.push(carouselHint);

  uiElements.forEach((el) => {
    el.style.opacity = "0";
  });
}


function setUIOpacity(value) {

  uiOpacity = THREE.MathUtils.clamp(value, 0, 1);

  uiElements.forEach((el) => {
    el.style.opacity = uiOpacity.toString();
  });

}


// ============================================================
// CREATE DISK LABELS
// ============================================================

function createDiskLabels() {

  labelsRoot.innerHTML = "";

  diskNames.forEach((name, index) => {

    const el = document.createElement("div");

    el.className = "disk-label";

    el.innerHTML = `
      <span>0${index + 1}</span>
      <b>${diskLabels[name]}</b>
    `;

    el.style.pointerEvents = "none";

    labelsRoot.appendChild(el);

    labelEls.set(name, el);

  });

}


// ============================================================
// LOADING
// ============================================================

function showLoading(show) {
  loading.classList.toggle("hidden", !show);
}


// ============================================================
// LOAD MODEL
// ============================================================

loader.load(

  "./scene.glb",

  (gltf) => {

    model = gltf.scene;
    scene.add(model);

    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });


    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);


    // ========================================================
    // FINAL CAMERA
    // ========================================================

    const finalDistance = maxSize * 1.45;

    homeCamera = {

      position: new THREE.Vector3(
        center.x,
        center.y + finalDistance * 0.48,
        center.z - finalDistance * 1.25
      ),

      target: new THREE.Vector3(
        center.x,
        center.y + maxSize * 0.18,
        center.z
      )

    };


    // ========================================================
    // INTRO START
    // ========================================================

    introCenter = center.clone();
    introDistance = maxSize * 1.45;

    camera.position.set(
      center.x + introDistance * 0.65,
      center.y + introDistance * 1.25,
      center.z + introDistance * 0.15
    );

    controls.target.set(
      center.x,
      center.y + maxSize * 0.20,
      center.z
    );

    controls.minDistance = maxSize * 0.35;
    controls.maxDistance = maxSize * 4;

    introAnimationStart = performance.now();
    mode = "intro";

    createDiskLabels();
    collectUIElements();
    setUIOpacity(0);
    showLoading(false);

  },

  undefined,

  (error) => {

    console.error("Ошибка загрузки scene.glb:", error);

    loading.querySelector("strong").textContent = "SCENE ERROR";
    loading.querySelector("small").textContent  = "Check scene.glb";

  }

);


// ============================================================
// RAYCASTER
// ============================================================

const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();
const worldPoint = new THREE.Vector3();


function getDiskFromPointer(event) {

  if (!model) return null;

  pointer.x =  (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const disks = diskNames
    .map(name => model.getObjectByName(name))
    .filter(Boolean);

  const hits = raycaster.intersectObjects(disks, true);

  if (!hits.length) return null;

  let disk = hits[0].object;

  while (disk.parent && !diskNames.includes(disk.name)) {
    disk = disk.parent;
  }

  return diskNames.includes(disk.name) ? disk : null;
}


// ============================================================
// MOUSE MOVE
// ============================================================

renderer.domElement.addEventListener("pointermove", (event) => {

  if (!model || mode !== "idle") {
    hoveredDisk = null;
    renderer.domElement.style.cursor = "default";
    return;
  }

  hoveredDisk = getDiskFromPointer(event);

  renderer.domElement.style.cursor =
    hoveredDisk ? "pointer" : "default";

});


renderer.domElement.addEventListener("pointerleave", () => {
  hoveredDisk = null;
  renderer.domElement.style.cursor = "default";
});


// ============================================================
// CLICK
// ============================================================

renderer.domElement.addEventListener("pointerdown", (event) => {

  if (!model || mode !== "idle") return;

  const disk = getDiskFromPointer(event);

  if (disk) insertDisk(disk);

});


// ============================================================
// FLOPPY DRIVE (куда вставляется дискета)
// ============================================================

// Точка прямо перед щелью дисковода (в мире)
const DRIVE_SLOT_POSITION = new THREE.Vector3(
  -1.3, 2.25, 0.75
);

// Точка внутри дисковода
const DRIVE_INSIDE_POSITION = new THREE.Vector3(
  -1.3, 2.25, 0.75
);


// ============================================================
// INSERT FLOPPY
// ============================================================

const DISK_ANIMATION_DURATION = 2400;
const CAMERA_ZOOM_DURATION    = 1000;

const DISK_TURN_ANGLE = Math.PI / 2;
const DISK_RISE_HEIGHT = 0.9;


function ease(t) {
  return t * t * (3 - 2 * t);
}


// Локальные оси дискеты на момент старта
function getLocalAxes(quaternion) {
  return {
    right: new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion),
    up:    new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion),
    fwd:   new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion)
  };
}


function insertDisk(disk) {

  if (!disk || mode !== "idle") return;

  selectedDisk = disk;


  // ---- Сохраняем исходное состояние ----
  disk.userData.startPosition   = disk.position.clone();
  disk.userData.startQuaternion = disk.quaternion.clone();
  disk.userData.startScale      = disk.scale.clone();


  const startPos  = disk.userData.startPosition.clone();
  const startQuat = disk.userData.startQuaternion.clone();
  const axes      = getLocalAxes(startQuat);


  // ---- Подъём по ЛОКАЛЬНОЙ оси Y дискеты ----
  const rise = startPos.clone()
    .addScaledVector(axes.up, DISK_RISE_HEIGHT);


  // ---- Поворот ВОКРУГ ЛОКАЛЬНОЙ оси Y дискеты ----
  // Умножаем исходный кватернион на поворот вокруг локального Y.
  const turnQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    DISK_TURN_ANGLE
  );

  const endQuat = startQuat.clone().multiply(turnQuat);


  // ---- Точки подлёта / вставки (в мире) ----
  const approach = DRIVE_SLOT_POSITION.clone();
  const target   = DRIVE_INSIDE_POSITION.clone();


  // ---- Сохраняем для updateInsertion / returnDisk ----
  disk.userData.risePosition   = rise;
  disk.userData.approachPosition = approach;
  disk.userData.targetPosition   = target;

  disk.userData.startQuaternion  = startQuat;
  disk.userData.endQuaternion    = endQuat;


  animationStart = performance.now();
  mode = "inserting";
}


// ------------------------------------------------------------
// UPDATE INSERT
// ------------------------------------------------------------

function updateInsertion(time) {

  if (!selectedDisk || mode !== "inserting") return;

  const disk = selectedDisk;

  const elapsed  = time - animationStart;
  const progress = Math.min(elapsed / DISK_ANIMATION_DURATION, 1);


  const startPos  = disk.userData.startPosition;
  const risePos   = disk.userData.risePosition;
  const approach  = disk.userData.approachPosition;
  const target    = disk.userData.targetPosition;

  const startQuat = disk.userData.startQuaternion;
  const endQuat   = disk.userData.endQuaternion;


  // 0 → 20% : подъём (без вращения)
  if (progress < 0.20) {

    const t = ease(progress / 0.20);

    disk.position.lerpVectors(startPos, risePos, t);
    disk.quaternion.copy(startQuat);

  }

  // 20 → 40% : поворот вокруг локальной Y
  else if (progress < 0.40) {

    const t = ease((progress - 0.20) / 0.20);

    disk.position.copy(risePos);
    disk.quaternion.copy(startQuat).slerp(endQuat, t);

  }

  // 40 → 70% : летим к дисководу (уже повёрнутые)
  else if (progress < 0.70) {

    const t = ease((progress - 0.40) / 0.30);

    disk.position.lerpVectors(risePos, approach, t);
    disk.quaternion.copy(endQuat);

  }

  // 70 → 100% : вставка внутрь
  else {

    const t = ease((progress - 0.70) / 0.30);

    disk.position.lerpVectors(approach, target, t);
    disk.quaternion.copy(endQuat);

  }


  if (progress >= 1) {

    disk.position.copy(target);
    disk.quaternion.copy(endQuat);

    startZoomIn();

  }

}


// ------------------------------------------------------------
// CAMERA ZOOM
// ------------------------------------------------------------

const SCREEN_CAMERA_POSITION = new THREE.Vector3(-1.58, 4.45, -2.8);
const SCREEN_CAMERA_TARGET   = new THREE.Vector3(-1.58, 4.47,  0.25);

let zoomFromPosition = new THREE.Vector3();
let zoomFromTarget   = new THREE.Vector3();
let zoomToPosition   = new THREE.Vector3();
let zoomToTarget     = new THREE.Vector3();


function startZoomIn() {

  zoomFromPosition.copy(camera.position);
  zoomFromTarget.copy(controls.target);

  zoomToPosition.copy(SCREEN_CAMERA_POSITION);
  zoomToTarget.copy(SCREEN_CAMERA_TARGET);

  animationStart = performance.now();
  mode = "zooming";
}


function updateZoom(time) {

  if (!selectedDisk ||
      (mode !== "zooming" && mode !== "returning")) return;

  const elapsed = time - animationStart;
  const progress = Math.min(elapsed / CAMERA_ZOOM_DURATION, 1);
  const t = ease(progress);


  if (mode === "zooming") {

    camera.position.lerpVectors(zoomFromPosition, zoomToPosition, t);
    controls.target.lerpVectors(zoomFromTarget, zoomToTarget, t);

    if (progress >= 1) {

      camera.position.copy(zoomToPosition);
      controls.target.copy(zoomToTarget);

      const label = diskLabels[selectedDisk.name];

      if (content[label]) {
        screenContent.innerHTML = content[label];
      }

      screenUI.classList.remove("hidden");
      mode = "screen";
    }

  } else if (mode === "returning") {

    camera.position.lerpVectors(zoomFromPosition, zoomToPosition, t);
    controls.target.lerpVectors(zoomFromTarget, zoomToTarget, t);

    if (progress >= 1) {

      camera.position.copy(zoomToPosition);
      controls.target.copy(zoomToTarget);

      animationStart = performance.now();
      mode = "returningDisk";

    }

  }

}


// ------------------------------------------------------------
// CLOSE SCREEN
// ------------------------------------------------------------

closeScreen.addEventListener("click", () => {

  if (!selectedDisk || mode !== "screen") return;

  screenUI.classList.add("hidden");

  zoomFromPosition.copy(camera.position);
  zoomFromTarget.copy(controls.target);

  zoomToPosition.copy(homeCamera.position);
  zoomToTarget.copy(homeCamera.target);

  animationStart = performance.now();
  mode = "returning";

});


// ------------------------------------------------------------
// RETURN FLOPPY (обратная анимация)
// ------------------------------------------------------------

function returnDisk() {

  if (!selectedDisk || mode !== "returningDisk") return;

  const disk = selectedDisk;

  const elapsed = performance.now() - animationStart;
  const progress = Math.min(elapsed / DISK_ANIMATION_DURATION, 1);


  const startPos = disk.userData.startPosition;
  const risePos  = disk.userData.risePosition;
  const approach = disk.userData.approachPosition;
  const target   = disk.userData.targetPosition;

  const startQuat = disk.userData.startQuaternion;
  const endQuat   = disk.userData.endQuaternion;


  // 0 → 30% : выезжаем из дисковода
  if (progress < 0.30) {

    const t = ease(progress / 0.30);

    disk.position.lerpVectors(target, approach, t);
    disk.quaternion.copy(endQuat);

  }

  // 30 → 60% : летим назад к точке подъёма
  else if (progress < 0.60) {

    const t = ease((progress - 0.30) / 0.30);

    disk.position.lerpVectors(approach, risePos, t);
    disk.quaternion.copy(endQuat);

  }

  // 60 → 80% : обратный разворот
  else if (progress < 0.80) {

    const t = ease((progress - 0.60) / 0.20);

    disk.position.copy(risePos);
    disk.quaternion.copy(endQuat).slerp(startQuat, t);

  }

  // 80 → 100% : опускаемся обратно
  else {

    const t = ease((progress - 0.80) / 0.20);

    disk.position.lerpVectors(risePos, startPos, t);
    disk.quaternion.copy(startQuat);

  }


  if (progress >= 1) {

    disk.position.copy(startPos);
    disk.quaternion.copy(startQuat);
    disk.scale.copy(disk.userData.startScale);

    selectedDisk = null;
    mode = "idle";

  }

}


// ============================================================
// DISK LABELS
// ============================================================

function updateLabels() {

  if (!model) return;

  const rect = renderer.domElement.getBoundingClientRect();

  diskNames.forEach((name) => {

    const disk = model.getObjectByName(name);
    const el = labelEls.get(name);

    if (!disk || !el) return;

    disk.getWorldPosition(worldPoint);

    worldPoint.y += 1.05;
    worldPoint.project(camera);

    const x = rect.left + ( worldPoint.x * 0.5 + 0.5) * rect.width;
    const y = rect.top  + (-worldPoint.y * 0.5 + 0.5) * rect.height;

    el.style.transform =
      `translate(-50%, -50%) translate(${x}px, ${y}px)`;

    el.style.opacity = uiOpacity.toString();

    el.classList.toggle("active", disk === hoveredDisk);

  });

}


// ============================================================
// CINEMATIC INTRO
// ============================================================

function updateIntroCamera(time) {

  if (mode !== "intro" || !introCenter || !homeCamera || !model) return;

  const duration = 4200;
  const raw = Math.min((time - introAnimationStart) / duration, 1);
  const t = raw * raw * (3 - 2 * raw);

  const startRadius = introDistance * 0.65;
  const endRadius   = introDistance * 1.45;
  const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);

  const startAngle = Math.PI * 0.15;
  const endAngle   = Math.PI * 2.5;
  const angle = THREE.MathUtils.lerp(startAngle, endAngle, t);

  const startHeight = introDistance * 1.25;
  const endHeight   = introDistance * 0.48;
  const height = THREE.MathUtils.lerp(startHeight, endHeight, t);


  camera.position.set(
    introCenter.x + Math.cos(angle) * radius,
    introCenter.y + height,
    introCenter.z - Math.sin(angle) * radius
  );

  const target = new THREE.Vector3(
    introCenter.x,
    introCenter.y + THREE.MathUtils.lerp(
      introDistance * 0.35,
      introDistance * 0.12,
      t
    ),
    introCenter.z
  );

  controls.target.copy(target);


  // Fade-in UI
  const fadeStart = 0.72;
  let uiT = 0;

  if (raw > fadeStart) {
    uiT = (raw - fadeStart) / (1 - fadeStart);
    uiT = uiT * uiT * (3 - 2 * uiT);
  }

  setUIOpacity(uiT);


  // Финал
  if (raw >= 1) {
    camera.position.copy(homeCamera.position);
    controls.target.copy(homeCamera.target);
    setUIOpacity(1);
    mode = "idle";
  }

}


// ============================================================
// MAIN LOOP
// ============================================================

function animate(time) {

  requestAnimationFrame(animate);

  updateIntroCamera(time);
  updateInsertion(time);
  updateZoom(time);

  if (mode === "returningDisk") {
    returnDisk();
  }

  updateLabels();

  controls.enabled = mode === "idle";
  controls.update();

  renderer.render(scene, camera);

}


requestAnimationFrame(animate);


// ============================================================
// RESIZE
// ============================================================

window.addEventListener("resize", () => {

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);

});