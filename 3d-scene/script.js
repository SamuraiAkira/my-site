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
  45, innerWidth / innerHeight, 0.01, 200
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
if (!sceneContainer) throw new Error('Не найден <main id="scene"></main>');
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

let introAnimationStart = 0;
let introCenter = null;
let introDistance = 0;

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
// TERMINAL CONTENT
// ------------------------------------------------------------
// type: "text"  — посимвольная печать + мигающий курсор
// type: "tui"   — построчная печать, без курсора
// ============================================================

const TERMINAL_CONTENT = {

  ABOUT: {
    path: "A:\\ABOUT.TXT",
    type: "text",
    speed: 25,
    jitter: 18,
    text:
`Welcome to FLOPPY://A

  > name : Nikita
  > role : developer
  > stack: web / linux / 3d

Этот сайт — небольшая интерактивная
визитка. Вставь дискету, чтобы перейти
в нужный раздел.

Если что-то не работает — попробуй
перезагрузить страницу (F5).
`
  },

  PROJECTS: {
    path: "A:\\PROJECTS",
    type: "text",
    speed: 25,
    jitter: 18,
    text:
`СПИСОК ПРОЕКТОВ:

  [1]  personal website
       react + three.js, вы здесь

  [2]  blender experiments
       сцены, рендеры, анимации

  [3]  home server
       debian, docker, nginx

  [4]  local ai
       llama.cpp + web ui

  [5]  misc tools
       cli-утилиты, скрипты
`
  },

  MUSIC: {
    path: "A:\\MUSIC",
    type: "tui",
    speed: 10,
    lines: [
`┌──────────────────────────────────────────────┐`,
`│  ▶  NOW PLAYING                              │`,
`├──────────────────────────────────────────────┤`,
`│                                              │`,
`│   [1]  Boards of Canada — Roygbiv            │`,
`│   [2]  Aphex Twin — Avril 14th               │`,
`│   [3]  Tycho — A Walk                        │`,
`│   [4]  Bonobo — Kerala                       │`,
`│                                              │`,
`├──────────────────────────────────────────────┤`,
`│   ▶ ────────────────●─────────  02:14/04:33  │`,
`│                                              │`,
`│   [Enter] play      [↑↓] select              │`,
`└──────────────────────────────────────────────┘`
    ]
  },

  CONTACT: {
    path: "A:\\CONTACT",
    type: "text",
    speed: 25,
    jitter: 18,
    text:
`КОНТАКТЫ:

  [gh]  github.com/yourname
  [tg]  t.me/yourname
  [em]  mail@example.com
  [www] yoursite.dev

Открыт для интересных проектов
и предложений.
`
  },

  GAMES: {
    path: "A:\\GAMES",
    type: "tui",
    speed: 10,
    lines: [
`┌──────────────────────────────────────────────┐`,
`│  GAMES / PLAYGROUND                          │`,
`├──────────────────────────────────────────────┤`,
`│                                              │`,
`│   > нажми [Enter] — запустить фейерверк      │`,
`│                                              │`,
`│   > [1] chess                                │`,
`│   > [2] snake                                │`,
`│   > [3] firework  (Enter)                    │`,
`│                                              │`,
`├──────────────────────────────────────────────┤`,
`│   [Esc] close                                │`,
`└──────────────────────────────────────────────┘`
    ],
    interactive: "fireworks"
  },

  SYSTEM: {
    path: "A:\\SYSTEM",
    type: "tui",
    speed: 10,
    lines: [
`        ▄▄▄▄▄▄▄▄        user@floppy`,
`      ▄████████████▄     ─────────────────`,
`     ████████████████    OS      : Floppy/OS 1.0`,
`    ████  ████  ████     Host    : 3D Portfolio`,
`    ████  ████  ████     Kernel  : three.js r180`,
`     ██████████████      Shell   : floppysh`,
`      ▀██████████▀       CPU     : WebGL Renderer`,
`                        GPU     : your adapter`,
`                        Memory  : OK`,
`                        ─────────────────`,
`                        ██████████ 90%`
    ]
  }

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

const terminal       = document.getElementById("terminal");
const terminalBody   = document.getElementById("terminalBody");
const terminalOutput = document.getElementById("terminalOutput");
const terminalClose  = document.getElementById("terminalClose");
const terminalPath   = document.getElementById("terminalPath");


// ============================================================
// UI FADE HELPERS
// ============================================================

function collectUIElements() {
  uiElements = [];
  if (intro)        uiElements.push(intro);
  if (header)       uiElements.push(header);
  if (carouselHint) uiElements.push(carouselHint);
  uiElements.forEach(el => { el.style.opacity = "0"; });
}

function setUIOpacity(value) {
  uiOpacity = THREE.MathUtils.clamp(value, 0, 1);
  uiElements.forEach(el => { el.style.opacity = uiOpacity.toString(); });
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
// MOUSE
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

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (!model || mode !== "idle") return;
  const disk = getDiskFromPointer(event);
  if (disk) insertDisk(disk);
});


// ============================================================
// FLOPPY DRIVE / INSERT / RETURN
// ============================================================

const DRIVE_SLOT_POSITION   = new THREE.Vector3(-1.3, 2.25,  0.75);
const DRIVE_INSIDE_POSITION = new THREE.Vector3(-1.3, 2.25, 0.75);

const DISK_ANIMATION_DURATION = 2400;
const CAMERA_ZOOM_DURATION    = 1000;

const DISK_TURN_ANGLE = Math.PI / 2;
const DISK_RISE_HEIGHT = 0.9;

function ease(t) { return t * t * (3 - 2 * t); }

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

  disk.userData.startPosition   = disk.position.clone();
  disk.userData.startQuaternion = disk.quaternion.clone();
  disk.userData.startScale      = disk.scale.clone();

  const startPos  = disk.userData.startPosition.clone();
  const startQuat = disk.userData.startQuaternion.clone();
  const axes      = getLocalAxes(startQuat);

  const rise = startPos.clone()
    .addScaledVector(axes.up, DISK_RISE_HEIGHT);

  const turnQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1), DISK_TURN_ANGLE
  );
  const endQuat = startQuat.clone().multiply(turnQuat);

  disk.userData.risePosition     = rise;
  disk.userData.approachPosition = DRIVE_SLOT_POSITION.clone();
  disk.userData.targetPosition   = DRIVE_INSIDE_POSITION.clone();
  disk.userData.startQuaternion  = startQuat;
  disk.userData.endQuaternion    = endQuat;

  animationStart = performance.now();
  mode = "inserting";
}

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

  if (progress < 0.20) {
    const t = ease(progress / 0.20);
    disk.position.lerpVectors(startPos, risePos, t);
    disk.quaternion.copy(startQuat);
  } else if (progress < 0.40) {
    const t = ease((progress - 0.20) / 0.20);
    disk.position.copy(risePos);
    disk.quaternion.copy(startQuat).slerp(endQuat, t);
  } else if (progress < 0.70) {
    const t = ease((progress - 0.40) / 0.30);
    disk.position.lerpVectors(risePos, approach, t);
    disk.quaternion.copy(endQuat);
  } else {
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


// ============================================================
// CAMERA ZOOM
// ============================================================

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
      openTerminal(label);

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


// ============================================================
// TERMINAL ENGINE
// ============================================================

let terminalTyping = null;         // { skip: fn, finished: Promise }
let terminalToken  = 0;            // защита от гонок при повторном открытии
let fireworksTimer = null;

function openTerminal(label) {
  const data = TERMINAL_CONTENT[label];
  if (!data) return;

  terminalToken++;
  const myToken = terminalToken;

  terminalPath.textContent = data.path;
  terminalOutput.textContent = "";
  terminal.classList.remove("hidden", "closing");
  // Принудительный reflow, чтобы transition сработал
  void terminal.offsetWidth;
  terminal.classList.add("visible");

  if (data.type === "text") {
    runTextMode(data, myToken);
  } else {
    runTuiMode(data, myToken);
  }
}

function closeTerminal() {
  if (mode !== "screen" && mode !== "printing") return;

  // Прерываем печать, если идёт
  if (terminalTyping && terminalTyping.skip) {
    terminalTyping.skip();
  }
  stopFireworks();

  terminal.classList.remove("visible");
  terminal.classList.add("closing");

  // Возвращаем камеру
  zoomFromPosition.copy(camera.position);
  zoomFromTarget.copy(controls.target);
  zoomToPosition.copy(homeCamera.position);
  zoomToTarget.copy(homeCamera.target);

  animationStart = performance.now();
  mode = "returning";

  // Через 350 мс — прячем окно и сбрасываем состояние
  setTimeout(() => {
    terminal.classList.add("hidden");
    terminal.classList.remove("closing");
    terminalOutput.textContent = "";
  }, 350);
}

// ------------------------------------------------------------
// RETURN FLOPPY
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

// ------------------------------------------------------------
// Режим "text": посимвольная печать + мигающий курсор
// ------------------------------------------------------------

function runTextMode(data, token) {
  mode = "printing";

  const cursor = document.createElement("span");
  cursor.className = "terminal-cursor";
  cursor.textContent = "\u00A0";

  let index = 0;
  let finished = false;

  const speed   = data.speed  ?? 25;
  const jitter  = data.jitter ?? 0;
  const text    = data.text ?? "";

  function render() {
    terminalOutput.textContent = text.slice(0, index);
    terminalOutput.appendChild(cursor);
  }

  function tick() {
    if (token !== terminalToken) return;      // окно перезапустили
    if (finished) return;

    if (index >= text.length) {
      finished = true;
      terminalTyping = null;
      mode = "screen";
      return;
    }

    index++;
    render();

    const j = jitter ? (Math.random() * jitter - jitter / 2) : 0;
    const delay = Math.max(4, speed + j);
    terminalTyping = { skip: finishNow };
    setTimeout(tick, delay);
  }

  function finishNow() {
    if (finished) return;
    finished = true;
    index = text.length;
    render();
    terminalTyping = null;
    mode = "screen";
  }

  render();
  terminalTyping = { skip: finishNow };
  setTimeout(tick, speed);
}


// ------------------------------------------------------------
// Режим "tui": построчная печать, без курсора
// ------------------------------------------------------------

function runTuiMode(data, token) {
  mode = "printing";

  const lines = data.lines ?? [];
  const speed = data.speed ?? 10;
  let i = 0;
  let finished = false;

  terminalOutput.textContent = "";

  function tick() {
    if (token !== terminalToken) return;
    if (finished) return;

    if (i >= lines.length) {
      finished = true;
      terminalTyping = null;
      mode = "screen";

      if (data.interactive === "fireworks") {
        bindFireworks();
      }
      return;
    }

    terminalOutput.textContent +=
      (i > 0 ? "\n" : "") + lines[i];
    i++;

    setTimeout(tick, speed);
  }

  function finishNow() {
    if (finished) return;
    finished = true;
    terminalOutput.textContent = lines.join("\n");
    terminalTyping = null;
    mode = "screen";

    if (data.interactive === "fireworks") {
      bindFireworks();
    }
  }

  terminalTyping = { skip: finishNow };
  setTimeout(tick, speed);
}


// ------------------------------------------------------------
// ASCII-фейерверк (Enter в GAMES)
// ------------------------------------------------------------

function bindFireworks() {
  // Навешиваем один раз
  if (fireworksTimer) return;

  const handler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      launchFireworks();
    }
  };
  window.addEventListener("keydown", handler);
  window.__fireworksHandler = handler;
}

function stopFireworks() {
  if (fireworksTimer) {
    clearInterval(fireworksTimer);
    fireworksTimer = null;
  }
  if (window.__fireworksHandler) {
    window.removeEventListener("keydown", window.__fireworksHandler);
    window.__fireworksHandler = null;
  }
}

function launchFireworks() {
  if (fireworksTimer) return;

  const W = 46;
  const H = 18;
  const particles = [];

  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 0.5 + 0.2;
    particles.push({
      x: W / 2,
      y: H / 2,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s * 0.7,
      life: 30 + Math.random() * 20,
      ch: ".,*+oO0@".charAt(
        Math.floor(Math.random() * 8)
      )
    });
  }

  let frame = 0;

  fireworksTimer = setInterval(() => {
    frame++;

    const grid = Array.from({ length: H }, () =>
      new Array(W).fill(" ")
    );

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.life--;

      const xi = Math.round(p.x);
      const yi = Math.round(p.y);

      if (
        xi >= 0 && xi < W &&
        yi >= 0 && yi < H &&
        p.life > 0
      ) {
        grid[yi][xi] = p.ch;
      }
    }

    terminalOutput.textContent =
      grid.map(row => row.join("")).join("\n");

    if (frame > 40) {
      clearInterval(fireworksTimer);
      fireworksTimer = null;
      terminalOutput.textContent =
        "🎆 boom! нажми [Enter] ещё раз 🎆";
    }
  }, 50);
}


// ------------------------------------------------------------
// Skip / close / keyboard
// ------------------------------------------------------------

function skipTyping() {
  if (terminalTyping && terminalTyping.skip) {
    terminalTyping.skip();
    return true;
  }
  return false;
}

terminalBody.addEventListener("pointerdown", (e) => {
  // Клик по телу терминала = skip
  skipTyping();
});

terminalClose.addEventListener("click", () => {
  closeTerminal();
});

window.addEventListener("keydown", (e) => {
  if (mode !== "screen" && mode !== "printing") return;

  if (e.key === "Escape") {
    const skipped = skipTyping();
    if (!skipped) {
      closeTerminal();
    }
  } else if (e.key === "Enter") {
    // Enter — skip во время печати, иначе ничего
    skipTyping();
  }
});


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

  const fadeStart = 0.72;
  let uiT = 0;
  if (raw > fadeStart) {
    uiT = (raw - fadeStart) / (1 - fadeStart);
    uiT = uiT * uiT * (3 - 2 * uiT);
  }
  setUIOpacity(uiT);

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