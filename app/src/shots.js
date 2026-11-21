// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the cover alone at an export size. Query knobs:
//   layout, grade, photos (comma list of samples/*.jpg), title, subtitle,
//   titlePos, color, w, h. window.__shotReady is set once painted.
import { LAYOUTS } from './cover.js';

const DEFAULT_PHOTOS = ['neon-strip.jpg', 'boulevard.jpg', 'neon-portrait.jpg', 'pier.jpg'];

export async function runShot(query, state, loadImage, redraw, syncUI) {
  const shot = query.get('shot');
  state.layout = query.get('layout') ?? 'hero';
  state.grade = query.get('grade') ?? 'sunset';
  state.title = query.get('title') ?? 'Vice Nights';
  state.subtitle = query.get('subtitle') ?? 'Welcome to the sunset city';
  state.titlePos = query.get('titlePos') ?? 'bottom';
  state.titleColor = query.get('color') ?? 'auto';

  const photos = (query.get('photos') ?? DEFAULT_PHOTOS.join(',')).split(',').filter(Boolean);
  const count = LAYOUTS[state.layout].panels;
  for (let i = 0; i < count; i++) {
    const file = photos[i % photos.length];
    const slot = state.panels[i];
    slot.img = await loadImage(`samples/${file}`);
    slot.name = file;
    slot.zoom = 1;
    slot.ox = 0;
    slot.oy = 0;
  }
  // A hero shot reads better with the wide strip pulled a touch tighter.
  if (state.layout === 'hero') state.panels[0].zoom = 1.15;

  if (shot === 'cover') {
    const canvas = document.getElementById('cover');
    canvas.width = Number(query.get('w') ?? 1920);
    canvas.height = Number(query.get('h') ?? 1080);
    document.body.classList.add('shot-cover');
  }

  if (document.fonts) {
    try {
      await document.fonts.load('80px Anton');
      await document.fonts.ready;
    } catch {
      // The fallback face still draws; the shot goes ahead.
    }
  }
  if (syncUI) syncUI();
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
