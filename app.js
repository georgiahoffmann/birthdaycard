import * as THREE from "three";

const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.z = 5.2;

// 6 faces, cada uma com um close-up diferente do rosto (ordem BoxGeometry: +x -x +y -y +z -z)
const mats = Array.from({ length: 6 }, () =>
  new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.85, metalness: 0, flatShading: true })
);
const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mats);
scene.add(cube);

// key light no canto superior esquerdo + preenchimento fraco
const key = new THREE.DirectionalLight(0xfff4e8, 3.2);
key.position.set(-4, 5, 4);
scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const s = Math.min(1, w / h * 1.1); // cubo menor em telas estreitas
  cube.scale.setScalar(Math.max(0.7, s));
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

// ---- interação: rotação diagonal contínua + parallax do mouse / arrasto do dedo
let px = 0, py = 0, ox = 0, oy = 0; // alvo e offset suavizado
function aim(x, y) {
  py = (x / innerWidth - 0.5) * Math.PI * 1.2;
  px = (y / innerHeight - 0.5) * Math.PI * 0.8;
}
addEventListener("mousemove", (e) => aim(e.clientX, e.clientY));
let dragging = false;
canvas.addEventListener("touchstart", (e) => { dragging = true; aim(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
canvas.addEventListener("touchmove", (e) => { if (dragging) aim(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
canvas.addEventListener("touchend", () => { dragging = false; });

renderer.setAnimationLoop((t) => {
  ox += (px - ox) * 0.06;
  oy += (py - oy) * 0.06;
  cube.rotation.y = t / 6000 + oy;
  cube.rotation.x = 0.45 + Math.sin(t / 9000) * 0.25 + ox;
  renderer.render(scene, camera);
});

// ---- texturas: cada face é um recorte macro do rosto
// todas as 6 faces mostram o rosto inteiro em close, com um pouco do fundo ao redor
const FACE_SCALE = 0.72; // lado do recorte / lado do quadrado da cabeça
const FACE_PX = 512;

function setFaces(img, box, faceY = 0.563) {
  // box: região quadrada da cabeça dentro de img, em pixels
  mats.forEach((m, i) => {
    const c = document.createElement("canvas");
    c.width = c.height = FACE_PX;
    const size = box.size * FACE_SCALE;
    const sx = box.x + box.size * 0.5 - size / 2;
    const sy = box.y + box.size * faceY - size / 2;
    c.getContext("2d").drawImage(img, sx, sy, size, size, 0, 0, FACE_PX, FACE_PX);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    m.map?.dispose();
    m.map = tex;
    m.bumpMap = tex; // micro-textura da pele reage à luz direcional
    m.bumpScale = 1;
    m.color.set(0xffffff);
    m.needsUpdate = true;
  });
}

// ---- recorte de cabeça: recorta ao redor do rosto detectado, sem resto da imagem
let detectorPromise;
function getDetector() {
  detectorPromise ??= (async () => {
    const { FaceDetector, FilesetResolver } = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
    );
    const fileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    return FaceDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      },
      runningMode: "IMAGE",
    });
  })();
  return detectorPromise;
}

// devolve o quadrado da cabeça (cabelo + queixo) dentro da imagem original
async function headBox(img) {
  const W = img.naturalWidth, H = img.naturalHeight;
  try {
    const det = await getDetector();
    const faces = det.detect(img).detections;
    if (faces.length) {
      const b = faces.map((f) => f.boundingBox).sort((a, c) => c.width * c.height - a.width * a.height)[0];
      const size = Math.min(Math.max(b.width, b.height) * 1.9, W, H);
      const cx = b.originX + b.width / 2;
      const cy = b.originY + b.height / 2 - b.height * 0.12;
      return {
        x: Math.min(Math.max(cx - size / 2, 0), W - size),
        y: Math.min(Math.max(cy - size / 2, 0), H - size),
        size,
      };
    }
  } catch (err) {
    console.warn("Detecção de rosto indisponível, usando recorte central.", err);
  }
  const size = Math.min(W, H) * 0.7;
  return { x: (W - size) / 2, y: Math.min(Math.max(H * 0.42 - size / 2, 0), H - size), size };
}

// ---- foto padrão
const base = new Image();
base.onload = () => setFaces(base, { x: 385, y: 317, size: 290 }); // cabeça dentro do selfie original
base.src = "assets/georgia.jpg";

// ---- upload
const file = document.getElementById("file");
const label = document.getElementById("upLabel");
file.addEventListener("change", () => {
  const f = file.files?.[0];
  if (!f) return;
  label.textContent = "[…] PROCESSANDO";
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = async () => {
      setFaces(img, await headBox(img));
      label.textContent = "[↑] BRINQUE AQUI";
    };
    img.onerror = () => { label.textContent = "[!] ARQUIVO INVÁLIDO"; };
    img.src = reader.result;
  };
  reader.readAsDataURL(f);
  file.value = "";
});
document.querySelector(".upload").addEventListener("click", () => file.click());
file.addEventListener("click", (e) => e.stopPropagation());

// ---- cores
const root = document.documentElement;
const bg = document.getElementById("bg"), fg = document.getElementById("fg");
const MOSS = "#4a7a26"; // hover padrão (verde musgo) enquanto as cores originais estão ativas
function bestOnColor(hex) { // preto ou branco, o que tiver mais contraste
  return contrast(hex, "#000000") >= contrast(hex, "#ffffff") ? "#000000" : "#ffffff";
}
function darken(hex, keep) { // mistura com preto, mantendo `keep` da cor original
  return "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * keep).toString(16).padStart(2, "0")).join("");
}
function applyColors(customized) {
  const set = (k, v) => root.style.setProperty(k, v);
  set("--bg", bg.value);
  set("--fg", fg.value);
  set("--fill", fg.value);
  if (customized) {
    // cores do usuário: preenchimento = cor do texto; texto do botão = cor de fundo;
    // texto do link = cor de fundo; hover = versão escurecida do preenchimento
    const hover = darken(fg.value, 0.55);
    set("--on-fill-btn", bg.value);
    set("--on-fill", bg.value);
    set("--fill-hover", hover);
    set("--on-fill-hover", bestOnColor(hover));
  } else {
    set("--on-fill", bg.value);
    set("--fill-hover", MOSS);
    set("--on-fill-hover", bestOnColor(MOSS));
  }
}
bg.addEventListener("input", () => applyColors(true));
fg.addEventListener("input", () => applyColors(true));
applyColors(false);

// ---- tracking do título: o último N de HOFFMANN alinha com o fim de ANIVERSARIO
const t1 = document.getElementById("t1"), t2 = document.getElementById("t2");
function fitTitle() {
  t1.style.letterSpacing = "0px";
  const r1 = t1.getBoundingClientRect(), r2 = t2.getBoundingClientRect();
  const ls2 = parseFloat(getComputedStyle(t2).letterSpacing) || 0; // espaço após a última letra
  const target = r2.right - ls2 - r1.left;
  const n = t1.textContent.length - 1;
  t1.style.letterSpacing = (target - r1.width) / n + "px";
  fitMeu();
}

// MEU alinhado à direita do "ORG" de GEORGIA: o U termina onde termina o G (sem tracking extra)
const t3 = document.getElementById("t3");
function fitMeu() {
  const range = document.createRange();
  const node = t1.firstChild;
  range.setStart(node, 2);
  range.setEnd(node, 5);
  const org = range.getBoundingClientRect();
  const ls1 = parseFloat(getComputedStyle(t1).letterSpacing) || 0; // espaço depois do G
  const ls3 = parseFloat(getComputedStyle(t3).letterSpacing) || 0; // espaço depois do U
  t3.style.marginLeft = "0px";
  const base = t3.getBoundingClientRect();
  const gRight = org.right - ls1;
  const uRight = base.right - ls3;
  t3.style.marginLeft = gRight - uRight + "px";
}

document.fonts.ready.then(fitTitle);
addEventListener("resize", fitTitle);
fitTitle();

// ---- aleatorizar: cores bem aleatórias, mas com contraste legível (WCAG AA, 4.5:1)
const MIN_CONTRAST = 4.5;
const rnd = (a, b) => a + Math.random() * (b - a);

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function randomPair() {
  const bgHex = hslToHex(rnd(0, 360), rnd(0, 100), rnd(0, 100));
  const hue = rnd(0, 360), sat = rnd(30, 100);
  // sorteia a cor do texto entre todas as luminosidades que passam no contraste
  const ok = [];
  for (let l = 0; l <= 100; l++) {
    const hex = hslToHex(hue, sat, l);
    if (contrast(bgHex, hex) >= MIN_CONTRAST) ok.push(hex);
  }
  return [bgHex, ok[Math.floor(Math.random() * ok.length)]];
}

document.getElementById("shuffle").addEventListener("click", () => {
  [bg.value, fg.value] = randomPair();
  applyColors(true);
});
