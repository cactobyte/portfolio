# Portfolio

Boris Cheung's portfolio. Next.js (App Router, TypeScript) with a 3D desk hero
built in React Three Fiber, styled with Tailwind, deployed on Vercel.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
npm run poster   # re-render the hero posters in src/assets/ (needs the site running and a local Chrome)
```

## How the home page works

1. **Wide shot.** The home hero is a tall scroll section with the 3D desk pinned
   in view. The desk leans toward the cursor (up to 6°). On phones it follows
   device tilt once permitted, and otherwise sways slowly.
2. **Fly-in.** Scrolling moves the camera along the keyframed path into the
   monitor. Scroll progress comes from framer-motion's `useScroll`.
3. **Screen.** On the monitor, the project list is real HTML (drei `<Html transform occlude>`):
   selectable, clickable and keyboard reachable.
4. **Hand-off.** After the hero, the page continues with normal sections.

Everything is driven by **`src/config/site.ts`**.

```
src/
  config/site.ts            theme tokens, scene objects, camera path, projects
  components/
    hero.tsx                scroll section, lazy scene, poster, loader, fallback
    nav-bar.tsx             nav + desk-lamp (theme) switch
    project-list.tsx        HTML project list (used by /projects and the fallback)
    theme.tsx               theme context, mirrors to <html data-theme>
    scene/
      scene.tsx             <Canvas>, lighting, objects, post-processing
      desk-object.tsx       one object: GLB or stand-in, outline, interactions
      stand-ins.tsx         primitive clay models for each object id
      camera-rig.tsx        scroll camera path, screen framing, cursor/gyro tilt
      monitor-screen.tsx    the HTML project list on the monitor
      lighting.tsx          clay daylight ↔ night blend
  lib/                      media queries, device tilt
app/                        routes; (site)/ pages share site-shell.tsx, volume/ is standalone
```

## Swap in a real model

Each object in `site.scene.objects` renders a primitive stand-in until you give
it a `modelPath`:

```ts
{ id: "mug", label: "Mug", modelPath: "/models/mug.glb", position: [0.42, 0.775, 0.12] },
```

- Put GLBs in `public/models/`. Draco compression is supported. The decoder
  loads from the drei/Google CDN by default; see `useGLTF` in `desk-object.tsx`
  to self-host it.
- Model conventions match the stand-ins: metres, origin where the object
  touches the surface below it (the floor for the desk and chair, the desktop
  for the rest), front facing +Z.
- Shadows, hover outline, cursor and interactions are applied automatically.
- **Monitor:** keep `screen` on the monitor object and adjust its `position`,
  `width` and `height` (local space) to match your model's display. The HTML
  list and the final camera framing both follow it.
- **Lamp:** `light` is the local position of the warm light it emits at night.
- Brand-new objects need a unique `id` and a `modelPath`. Only the ids in
  `StandInId` have stand-ins.

Interactions: `"wiggle"` (hover bends it on springs; click squashes it and opens or
closes a flower), `"toggleLight"` (click switches theme), `"focusScreen"` (click
flies to the monitor). A wiggle model bends from a node named `sway` if it has one
(else the whole object bends), and a node named `bloom` is the flower.

## Projects

`site.projects` feeds the /projects page (a loose masonry of cards) and the 3D
monitor. To give a card a picture, put it in `src/assets/projects/`, import it at
the top of `site.ts` and add `image: { src, alt }`. It shows at its own shape. Add
`fit: "contain"` for a logo, which centres it on a tinted tile. Cards without a
picture are text only, on a tint. The order in the config is the reading order,
filling each column from top to bottom.

## Theme

`site.theme.presets` holds the two token sets, `clay` and `night`. They become
CSS variables (`--bg`, `--ink`, `--accent`, `--warm`, `--lamp`, `--screen`) and
Tailwind colours (`bg-bg`, `text-ink`, `bg-accent`, …), and the 3D scene blends
its lighting between them.

- **Default theme:** change `site.theme.default` to `"night"`.
- **Change colours:** edit the preset hex values. Derived tones (`muted`,
  `line`, `surface`, `screen-surface`) are mixed in `app/globals.css`.
- The desk lamp (or the lamp button in the nav) switches themes at runtime.

## Camera path

`site.scene.camera.keyframes` are `{ at, position, target }` points at scroll
progress `at` (0–1), joined by a smooth curve.

- A keyframe with `fitScreen: true` ignores `position` and frames the monitor
  screen for the current viewport, below the nav.
- `site.scene.scrollLength` sets how many screen heights the fly-in takes.

## Quality

- **Performance:** three.js loads only after first paint, and the poster image
  is the first paint. The render loop stops while the hero is off screen.
  Phones get DPR ≤ 1.5, smaller shadow maps and no post-processing.
- **No WebGL:** the hero shows the poster and the home page lists projects as
  plain HTML.
- **Reduced motion:** no tilt, no wiggle, and the camera cuts between the
  wide shot and the monitor instead of flying.
- **Projects outside 3D:** every project is also on `/projects` as a normal
  HTML list.

## Assumptions

These were made instead of asking. Change any that are wrong.

- **Folders:** `app/` stays at the repo root, and config and components live
  in `src/` as briefed. Imports use `@/src/...`.
- **Scrolling:** native page scroll with framer-motion's `useScroll` drives the
  camera, not drei `ScrollControls` or GSAP. This keeps normal scrolling,
  anchors and the hand-off to page sections working, with no extra dependency.
- **Lamp:** the desk lamp switches the whole site between clay and night, not
  just the scene. A nav button does the same for keyboard and screen-reader
  users. The choice isn't persisted.
- **Missing tokens:** the brief's clay preset has no `lamp` or `screen`
  colours, so clay uses `#FFE2B8` and `#DCE8DE`.
- **Fonts:** Funnel Display for headings and Funnel Sans for text. They are
  soft and rounded like the clay models, and not a serif, so the page doesn't
  read as the stock cream-and-terracotta look.
- **Monitor content:** shows names, status and descriptions, and drops
  descriptions on narrow screens so the text stays readable. Full details
  (tags, links) are on `/projects`. The UI is laid out at a fixed design
  width and rendered at about viewport width with CSS `zoom`, so the 3D
  transform only scales it down and the text stays sharp.
- **Monitor while flying:** phones scroll the page on a separate thread, so
  HTML positioned from script slips off the screen mid-scroll (iOS Safari
  especially). Until the camera arrives, the screen shows a texture painted
  from the same HTML (`snapshot-element.ts`); on desktop the live HTML then
  takes over. Touch screens keep the texture and hit-test taps against its links.
- **Home page order:** name, role and social icon buttons (`site.socials`)
  sit over the 3D hero. After the fly-in come the intro line and the CV and
  projects buttons.
- **Contact:** "Contact me" (nav on desktop, footer link on mobile) jumps to
  `/#contact`, the top of the hero, where the social icons and an email button
  are. The email button is a `mailto:` link that also copies the address, since
  `mailto:` does nothing when the visitor has no mail app set up.
- **Effects:** the hover outline and ambient occlusion use
  `@react-three/postprocessing` on desktop only.
- **Phone tilt:** where the browser requires permission (iOS), a "Tilt the
  desk with your phone" button asks for it. Otherwise orientation is used
  directly, and the scene sways slowly if no orientation data arrives.
- **Posters:** `src/assets/desk-poster-{landscape,portrait}.jpg` are renders
  of the clay scene at rest (1750×1000, the camera's composed landscape aspect,
  and 390×844 on the phone render path).
  They're statically imported, so their URLs change whenever they're
  re-rendered, and `.desk-poster` in `app/globals.css` places them where
  the camera frames the desk. Re-run `npm run poster` after changing the
  scene; if you change the render sizes or the camera's subject offsets,
  update that CSS too.
