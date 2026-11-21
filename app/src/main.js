// Vice Nights — wires the page: panel slots, layout / grade / caption controls,
// drag-to-crop on the preview, and PNG export in the three post sizes.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, layoutPanels, LAYOUTS, GRADES, EXPORT_SIZES } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = [
  { file: 'neon-strip.jpg', label: 'Neon strip' },
  { file: 'boulevard.jpg', label: 'Boulevard' },
  { file: 'neon-portrait.jpg', label: 'Neon portrait' },
  { file: 'pier.jpg', label: 'Pier' },
];

const TITLE_COLORS = [
  { value: 'auto', label: 'Grade gradient', css: 'linear-gradient(180deg,#fff,#ffb347)' },
  { value: '#ffffff', label: 'White', css: '#ffffff' },
  { value: '#ffd166', label: 'Sunset gold', css: '#ffd166' },
  { value: '#ff5fd2', label: 'Hot pink', css: '#ff5fd2' },
  { value: '#7df9ff', label: 'Neon cyan', css: '#7df9ff' },
];

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const panelList = document.getElementById('panelList');
const panelNum = document.getElementById('panelNum');
const zoomInput = document.getElementById('zoom');
const oxInput = document.getElementById('ox');
const oyInput = document.getElementById('oy');
const filePicker = document.getElementById('filePicker');

/** One slot per panel the widest layout needs; layouts use a prefix of them. */
const state = {
  layout: 'hero',
  grade: 'sunset',
  title: 'Vice Nights',
  subtitle: 'Welcome to the sunset city',
  titleColor: 'auto',
  titlePos: 'bottom',
  panels: [
    { img: null, name: '', zoom: 1, ox: 0, oy: 0 },
    { img: null, name: '', zoom: 1, ox: 0, oy: 0 },
    { img: null, name: '', zoom: 1, ox: 0, oy: 0 },
    { img: null, name: '', zoom: 1, ox: 0, oy: 0 },
  ],
};
let selected = 0;
let exportSize = EXPORT_SIZES[0];

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function panelCount() {
  return LAYOUTS[state.layout].panels;
}

function redraw() {
  drawCover(canvas, state);
}

function syncPanelEditor() {
  const slot = state.panels[selected];
  panelNum.textContent = String(selected + 1);
  zoomInput.value = String(slot.zoom);
  oxInput.value = String(slot.ox);
  oyInput.value = String(slot.oy);
}

function renderPanelList() {
  panelList.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const slot = state.panels[i];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'panel-card' + (i === selected ? ' selected' : '');
    card.setAttribute('aria-pressed', i === selected ? 'true' : 'false');
    const thumb = document.createElement('img');
    thumb.className = 'thumb';
    thumb.alt = '';
    if (slot.img) thumb.src = slot.img.src;
    const meta = document.createElement('span');
    meta.className = 'meta';
    const name = document.createElement('b');
    name.textContent = `Panel ${i + 1}`;
    const detail = document.createElement('span');
    detail.textContent = slot.img ? slot.name : 'Empty — add a photo';
    meta.append(name, detail);
    card.append(thumb, meta);
    card.addEventListener('click', () => {
      selected = i;
      renderPanelList();
      syncPanelEditor();
      redraw();
    });
    panelList.appendChild(card);
  }
}

function buildSegment(container, entries, current, onPick) {
  container.innerHTML = '';
  for (const [value, label] of entries) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.setAttribute('aria-pressed', value === current ? 'true' : 'false');
    btn.addEventListener('click', () => {
      onPick(value);
      [...container.children].forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
    });
    container.appendChild(btn);
  }
}

buildSegment(
  document.getElementById('layoutButtons'),
  Object.entries(LAYOUTS).map(([k, v]) => [k, v.name]),
  state.layout,
  (value) => {
    state.layout = value;
    if (selected >= panelCount()) selected = 0;
    renderPanelList();
    syncPanelEditor();
    redraw();
  },
);

buildSegment(
  document.getElementById('gradeButtons'),
  Object.entries(GRADES).map(([k, v]) => [k, v.name]),
  state.grade,
  (value) => {
    state.grade = value;
    redraw();
  },
);

buildSegment(
  document.getElementById('sizeButtons'),
  EXPORT_SIZES.map((s, i) => [String(i), s.label]),
  '0',
  (value) => {
    exportSize = EXPORT_SIZES[Number(value)];
    canvas.width = exportSize.w;
    canvas.height = exportSize.h;
    redraw();
  },
);

// Title colour swatches.
const swatches = document.getElementById('colorSwatches');
for (const color of TITLE_COLORS) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.title = color.label;
  btn.setAttribute('aria-label', `Title colour: ${color.label}`);
  btn.style.background = color.css;
  btn.setAttribute('aria-pressed', color.value === state.titleColor ? 'true' : 'false');
  btn.addEventListener('click', () => {
    state.titleColor = color.value;
    [...swatches.children].forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    redraw();
  });
  swatches.appendChild(btn);
}

// Caption inputs.
document.getElementById('title').addEventListener('input', (e) => {
  state.title = e.target.value;
  redraw();
});
document.getElementById('subtitle').addEventListener('input', (e) => {
  state.subtitle = e.target.value;
  redraw();
});
document.getElementById('titlePos').addEventListener('change', (e) => {
  state.titlePos = e.target.value;
  redraw();
});

// Selected-panel crop controls.
zoomInput.addEventListener('input', () => {
  state.panels[selected].zoom = Number(zoomInput.value);
  redraw();
});
oxInput.addEventListener('input', () => {
  state.panels[selected].ox = Number(oxInput.value);
  redraw();
});
oyInput.addEventListener('input', () => {
  state.panels[selected].oy = Number(oyInput.value);
  redraw();
});

// Photo sources for the selected panel.
filePicker.addEventListener('change', async () => {
  const file = filePicker.files[0];
  filePicker.value = '';
  if (!file) return;
  const slot = state.panels[selected];
  slot.img = await loadImage(URL.createObjectURL(file));
  slot.name = file.name;
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  renderPanelList();
  syncPanelEditor();
  redraw();
});
document.getElementById('uploadPhoto').addEventListener('click', () => filePicker.click());
document.getElementById('samplePhoto').addEventListener('click', async () => {
  const slot = state.panels[selected];
  const at = SAMPLES.findIndex((s) => s.file === slot.name);
  const next = SAMPLES[(at + 1) % SAMPLES.length];
  slot.img = await loadImage(`samples/${next.file}`);
  slot.name = next.file;
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  renderPanelList();
  syncPanelEditor();
  redraw();
});
document.getElementById('clearPhoto').addEventListener('click', () => {
  const slot = state.panels[selected];
  slot.img = null;
  slot.name = '';
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  renderPanelList();
  syncPanelEditor();
  redraw();
});
document.getElementById('fillSamples').addEventListener('click', async () => {
  for (let i = 0; i < panelCount(); i++) {
    const slot = state.panels[i];
    if (slot.img) continue;
    const sample = SAMPLES[i % SAMPLES.length];
    slot.img = await loadImage(`samples/${sample.file}`);
    slot.name = sample.file;
  }
  renderPanelList();
  redraw();
});

// Drag to move the photo, scroll to zoom, click to select a panel.
let drag = null;
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
}
function panelAt(x, y) {
  const rects = layoutPanels(state.layout, canvas.width, canvas.height);
  for (let i = 0; i < panelCount(); i++) {
    const [rx, ry, rw, rh] = rects[i];
    if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) return i;
  }
  return -1;
}
canvas.addEventListener('pointerdown', (e) => {
  const { x, y } = canvasPoint(e);
  const i = panelAt(x, y);
  if (i < 0) return;
  selected = i;
  renderPanelList();
  syncPanelEditor();
  drag = { x, y, ox: state.panels[i].ox, oy: state.panels[i].oy };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const { x, y } = canvasPoint(e);
  const rects = layoutPanels(state.layout, canvas.width, canvas.height);
  const [rx, ry, rw, rh] = rects[selected];
  void rx;
  void ry;
  const slot = state.panels[selected];
  slot.ox = Math.max(-0.5, Math.min(0.5, drag.ox + (x - drag.x) / rw));
  slot.oy = Math.max(-0.5, Math.min(0.5, drag.oy + (y - drag.y) / rh));
  syncPanelEditor();
  redraw();
});
canvas.addEventListener('pointerup', () => {
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const { x, y } = canvasPoint(e);
  const i = panelAt(x, y);
  if (i < 0) return;
  selected = i;
  const slot = state.panels[i];
  slot.zoom = Math.max(1, Math.min(3, slot.zoom * Math.exp(-e.deltaY * 0.0012)));
  renderPanelList();
  syncPanelEditor();
  redraw();
}, { passive: false });

// Export the cover at the chosen post size.
document.getElementById('export').addEventListener('click', () => {
  const out = document.createElement('canvas');
  out.width = exportSize.w;
  out.height = exportSize.h;
  drawCover(out, state);
  out.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-nights-${exportSize.w}x${exportSize.h}.png`;
    a.click();
    status.textContent = `Saved vice-nights-${exportSize.w}x${exportSize.h}.png`;
    setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
  }, 'image/png');
});

// The Anton display face arrives after the first paint; redraw once it is in.
if (document.fonts) {
  document.fonts.load('80px Anton').then(redraw).catch(() => {});
  document.fonts.ready.then(redraw).catch(() => {});
}

renderPanelList();
syncPanelEditor();

const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  runShot(query, state, loadImage, redraw, () => {
    renderPanelList();
    syncPanelEditor();
  });
} else {
  redraw();
}
