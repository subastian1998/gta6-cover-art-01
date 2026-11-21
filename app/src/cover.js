// Vice Nights — the cover renderer. Draws a multi-panel GTA-style poster onto any
// 2D canvas at any size: photos cover-fit into panels, a Vice City sunset / neon
// colour grade over each panel, and bold Anton lettering with a dark outline.
//
// A panel slot is { img, zoom, ox, oy }: img is an <img> (or null for an empty
// slot), zoom multiplies the cover-fit scale (1 = just fills the panel), and
// ox / oy shift the photo by that fraction of the panel's width / height.
// The app state is { layout, grade, title, subtitle, titleColor, titlePos, panels }.

export const LAYOUTS = {
  hero: { name: 'Hero + duo', panels: 3 },
  grid: { name: 'Four up', panels: 4 },
  trio: { name: 'Triple split', panels: 3 },
};

export const GRADES = {
  sunset: { name: 'Sunset' },
  neon: { name: 'Neon' },
  noir: { name: 'Noir' },
  clean: { name: 'Clean' },
};

export const EXPORT_SIZES = [
  { label: '1080 x 1080', w: 1080, h: 1080 },
  { label: '1080 x 1350', w: 1080, h: 1350 },
  { label: '1920 x 1080', w: 1920, h: 1080 },
];

/** Panel rectangles for a layout, as [x, y, w, h] fractions of the canvas. */
export function layoutPanels(layout, w, h) {
  const g = Math.max(4, Math.round(Math.min(w, h) * 0.008));
  if (layout === 'grid') {
    const cw = (w - g) / 2;
    const ch = (h - g) / 2;
    return [
      [0, 0, cw, ch],
      [cw + g, 0, cw, ch],
      [0, ch + g, cw, ch],
      [cw + g, ch + g, cw, ch],
    ];
  }
  if (layout === 'trio') {
    const cw = (w - 2 * g) / 3;
    return [
      [0, 0, cw, h],
      [cw + g, 0, cw, h],
      [2 * (cw + g), 0, cw, h],
    ];
  }
  // hero: one wide panel on top, two side by side below.
  const hh = Math.round(h * 0.62);
  const bw = (w - g) / 2;
  const bh = h - hh - g;
  return [
    [0, 0, w, hh],
    [0, hh + g, bw, bh],
    [bw + g, hh + g, bw, bh],
  ];
}

/** Cover-fits a photo into a panel rect, honouring its zoom and offset. */
function drawPanelPhoto(ctx, img, rect, zoom, ox, oy, grade) {
  const [rx, ry, rw, rh] = rect;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(rw / iw, rh / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rx + (rw - dw) / 2 + ox * rw;
  const dy = ry + (rh - dh) / 2 + oy * rh;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  if (grade === 'noir') ctx.filter = 'grayscale(1) contrast(1.12) brightness(0.96)';
  else if (grade === 'neon') ctx.filter = 'saturate(1.35) contrast(1.06)';
  else ctx.filter = 'saturate(1.18) contrast(1.04)';
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  ctx.restore();
}

/** The empty-slot look: a deep violet-to-magenta gradient with a big numeral. */
function drawEmptyPanel(ctx, rect, index) {
  const [rx, ry, rw, rh] = rect;
  const grad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
  grad.addColorStop(0, '#2a1245');
  grad.addColorStop(0.55, '#4b1d63');
  grad.addColorStop(1, '#7a2058');
  ctx.fillStyle = grad;
  ctx.fillRect(rx, ry, rw, rh);
  const size = Math.min(rw, rh) * 0.42;
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.fillText(String(index + 1), rx + rw / 2, ry + rh / 2 - size * 0.1);
  const label = Math.min(rw, rh) * 0.055;
  ctx.font = `bold ${Math.max(10, label)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText('ADD A PHOTO', rx + rw / 2, ry + rh / 2 + size * 0.42);
}

/** The colour grade wash + vignette over one panel. */
function drawGradeWash(ctx, rect, grade) {
  const [rx, ry, rw, rh] = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  let wash;
  if (grade === 'sunset') {
    wash = ctx.createLinearGradient(0, ry, 0, ry + rh);
    wash.addColorStop(0, 'rgba(255, 150, 60, 0.10)');
    wash.addColorStop(0.55, 'rgba(255, 90, 60, 0.05)');
    wash.addColorStop(1, 'rgba(214, 40, 120, 0.34)');
  } else if (grade === 'neon') {
    wash = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
    wash.addColorStop(0, 'rgba(255, 0, 170, 0.20)');
    wash.addColorStop(0.5, 'rgba(120, 0, 255, 0.06)');
    wash.addColorStop(1, 'rgba(0, 220, 255, 0.20)');
  } else if (grade === 'noir') {
    wash = ctx.createLinearGradient(0, ry, 0, ry + rh);
    wash.addColorStop(0, 'rgba(8, 8, 26, 0.10)');
    wash.addColorStop(1, 'rgba(8, 8, 26, 0.42)');
  } else {
    wash = ctx.createLinearGradient(0, ry, 0, ry + rh);
    wash.addColorStop(0, 'rgba(0, 0, 0, 0)');
    wash.addColorStop(1, 'rgba(0, 0, 0, 0.10)');
  }
  ctx.fillStyle = wash;
  ctx.fillRect(rx, ry, rw, rh);
  // Vignette: darken the panel's edges so the lettering sits on top cleanly.
  const vx = rx + rw / 2;
  const vy = ry + rh / 2;
  const vig = ctx.createRadialGradient(vx, vy, Math.min(rw, rh) * 0.35, vx, vy, Math.max(rw, rh) * 0.75);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, grade === 'noir' ? 'rgba(0, 0, 0, 0.42)' : 'rgba(0, 0, 0, 0.26)');
  ctx.fillStyle = vig;
  ctx.fillRect(rx, ry, rw, rh);
  ctx.restore();
}

/** Bold Anton title + letterspaced subtitle, with a dark scrim behind them. */
function drawLettering(ctx, state, w, h) {
  const title = state.title.trim().toUpperCase();
  const subtitle = state.subtitle.trim().toUpperCase();
  if (!title && !subtitle) return;
  const bottom = state.titlePos !== 'top';
  const scrimH = h * 0.34;
  const scrim = ctx.createLinearGradient(0, bottom ? h - scrimH : 0, 0, bottom ? h : scrimH);
  if (bottom) {
    scrim.addColorStop(0, 'rgba(12, 4, 22, 0)');
    scrim.addColorStop(1, 'rgba(12, 4, 22, 0.78)');
  } else {
    scrim.addColorStop(0, 'rgba(12, 4, 22, 0.78)');
    scrim.addColorStop(1, 'rgba(12, 4, 22, 0)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bottom ? h - scrimH : 0, w, scrimH);

  const cx = w / 2;
  let titleSize = h * 0.15;
  const fit = (size) => {
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    return ctx.measureText(title).width;
  };
  while (title && fit(titleSize) > w * 0.92 && titleSize > 12) titleSize -= 2;
  const subSize = Math.max(11, Math.round(titleSize * 0.2));
  const gap = titleSize * 0.28;
  const margin = h * 0.055;
  // Baselines: the title sits above the subtitle; the block hugs the edge.
  let titleBaseline;
  let subBaseline;
  if (bottom) {
    subBaseline = h - margin;
    titleBaseline = subBaseline - (subtitle ? gap + subSize : 0);
  } else {
    titleBaseline = margin + titleSize;
    subBaseline = titleBaseline + gap + subSize;
  }

  if (!title && subtitle) {
    // No title: the subtitle takes the edge on its own.
    subBaseline = bottom ? h - margin : margin + subSize;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if (title) {
    const top = titleBaseline - titleSize;
    let fill;
    if (state.titleColor && state.titleColor !== 'auto') {
      fill = state.titleColor;
    } else {
      fill = ctx.createLinearGradient(0, top - titleSize, 0, top);
      if (state.grade === 'neon') {
        fill.addColorStop(0, '#ffffff');
        fill.addColorStop(1, '#ff7ae0');
      } else if (state.grade === 'noir') {
        fill.addColorStop(0, '#ffffff');
        fill.addColorStop(1, '#d8d8e2');
      } else {
        fill.addColorStop(0, '#ffffff');
        fill.addColorStop(1, '#ffb347');
      }
    }
    ctx.font = `${titleSize}px Anton, 'Arial Narrow', sans-serif`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(22, 5, 32, 0.9)';
    ctx.lineWidth = Math.max(2, titleSize * 0.07);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = titleSize * 0.08;
    ctx.shadowOffsetY = titleSize * 0.03;
    ctx.strokeText(title, cx, titleBaseline);
    ctx.fillStyle = fill;
    ctx.fillText(title, cx, titleBaseline);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  if (subtitle) {
    ctx.font = `700 ${subSize}px system-ui, sans-serif`;
    try {
      ctx.letterSpacing = `${Math.round(subSize * 0.32)}px`;
    } catch {
      // letterSpacing is Chrome-only; the subtitle still draws without it.
    }
    ctx.fillStyle = state.grade === 'neon' ? '#7df9ff' : state.grade === 'noir' ? '#ffffff' : '#ffd166';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = subSize * 0.3;
    ctx.fillText(subtitle, cx, subBaseline);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    try {
      ctx.letterSpacing = '0px';
    } catch {
      // no-op
    }
  }
}

/** Draws the whole cover for `state` onto `canvas` at the canvas's own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#140821';
  ctx.fillRect(0, 0, w, h);
  const rects = layoutPanels(state.layout, w, h);
  const count = LAYOUTS[state.layout].panels;
  for (let i = 0; i < count; i++) {
    const slot = state.panels[i];
    if (slot && slot.img) drawPanelPhoto(ctx, slot.img, rects[i], slot.zoom, slot.ox, slot.oy, state.grade);
    else drawEmptyPanel(ctx, rects[i], i);
    drawGradeWash(ctx, rects[i], state.grade);
    // A thin pale frame around every panel: the poster's grid.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(1.5, Math.min(w, h) * 0.003);
    ctx.strokeRect(rects[i][0], rects[i][1], rects[i][2], rects[i][3]);
  }
  drawLettering(ctx, state, w, h);
}
