# Vice Nights — GTA 6-style cover art maker

![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/subastian1998/gta6-cover-art-01/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/subastian1998/gta6-cover-art-01/reward.svg)

Turn your photos and a caption into a multi-panel poster in the style of GTA 6
cover art — the Vice City sunset look, bold caption lettering, exported as a
PNG to share. Made for the [make.fun](https://make.fun) `gta6-cover-art-01`
bounty.

## What it does

- **Any photo, several panels** — upload your own photos (they stay on your
  machine, never uploaded) or use the bundled samples, and fill up to four
  panels with one photo or several.
- **Crop & position each panel** — zoom and move sliders per panel, or click a
  panel in the live preview, drag it to move the photo, scroll to zoom.
- **Three layouts** — Hero + duo (one wide panel over two), Four up (2×2 grid),
  Triple split (three columns).
- **Four colour grades** — Sunset, Neon, Noir, Clean: a Vice City sunset or
  neon wash plus a vignette over every panel.
- **Bold caption lettering** — Anton (SIL Open Font License, vendored under
  `app/fonts/`) with a dark outline and a grade-matched gradient, title colour
  swatches, top or bottom placement, and a letterspaced subtitle.
- **Fast export** — one click exports a PNG in the common post sizes
  1080 × 1080, 1080 × 1350 or 1920 × 1080.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

The app is plain static files under `app/` with no build step: `app/index.html`
opens in desktop Chrome and works with **no network request**. Every script,
font and image it loads is a file under `app/`; photos are read locally.

## Screenshots

| File | Shows |
| --- | --- |
| `screenshots/1-cover.jpg` | Exported 1920 × 1080 cover, Hero layout, Sunset grade |
| `screenshots/2-editor.jpg` | The editor in the browser with photos loaded |
| `screenshots/3-cover-portrait.jpg` | Exported 1080 × 1350 cover, Four up layout, Neon grade |
| `screenshots/4-cover-square.jpg` | Exported 1080 × 1080 cover, Triple split layout, Noir grade |

The screenshots were taken with headless Chromium from the app itself
(`?shot=cover` / `?shot=editor` scenes in `app/src/shots.js` — see
`shots.json`); the sample photos are the kit's `boulevard.jpg` / `pier.jpg`
plus two AI-generated samples (`neon-strip.jpg`, `neon-portrait.jpg`).

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored
`vendor/makefun-app.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Originality

No Rockstar Games logo, wordmark, official artwork, character or font is used.
The only font is Anton, licensed under the SIL Open Font License 1.1 (see
`app/fonts/OFL.txt`). All photos are the kit's samples or AI-generated.

## License

MIT — see [LICENSE](LICENSE).

Referral code: `7gw1p7j6`
