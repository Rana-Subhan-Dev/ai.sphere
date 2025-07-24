# 🌍 Airis Vortex: 3D Globe + Infinite Grid Canvas

## ✨ Goal

Build a **3D globe interface** (the Vortex) that:

- Visualizes **Spheres as interactive nodes** on its surface.
- Has a **2D infinite grid/canvas** as a texture over the globe (like Apple Maps).
- On zoom-in or click of a Sphere, the globe **transitions smoothly** into that Sphere’s 2D **Space view**, which is the **same infinite canvas** used on the globe (not a different view).
- Allows users to **navigate between Spheres and Spaces** through spatial metaphors and zoom interactions — like flying into cities on Apple Maps.

---

## 🧱 High-Level Architecture

### 1. **Globe (3D View)**
- WebGL-rendered sphere.
- Texture is an infinite grid/canvas.
- Interactive Nodes = Spheres.
- Controls: rotate, zoom, pan.

### 2. **Canvas (2D View)**
- Zooming into a Sphere unwraps the canvas in 2D space.
- Infinite panning + smooth transitions from the globe.

### 3. **Unified Coordinate System**
- Shared world coordinates between globe and 2D canvas.
- Zooming simply alters projection/camera & dimensionality — the data stays the same.

---

## 🔧 Tech Stack & Library Suggestions

### 🌐 3D Rendering

Use for MVP: https://github.com/vasturiano/globe.gl

Use later for more polished version:

- [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber): React renderer for Three.js — performant, idiomatic.
- [`@react-three/drei`](https://github.com/pmndrs/drei): Helpers for camera controls, lighting, shaders, etc.
- [`three.js`](https://threejs.org/): Core WebGL engine.

### 📐 Canvas/Grid System

Use for MVP: https://reactflow.dev

Use later for more polished version:

- [`pixi.js`](https://pixijs.com/) or [`konva`](https://konvajs.org/): Efficient for drawing/editing on the 2D grid.
- [`react-zoom-pan-pinch`](https://github.com/prc5/react-zoom-pan-pinch): For basic 2D infinite canvas controls (can be replaced with custom).
- Custom WebGL shaders (optional): For dynamic grid textures or procedural visuals.

### 🌀 Transitions & State Management
- [`framer-motion`](https://www.framer.com/motion/): Smooth transitions between 3D <-> 2D states.
- `zustand` or `valtio`: For lightweight global state (selected sphere, camera zoom, etc).
- Optional: `react-spring` for more physics-based transitions.

---

## 🧭 Development Phases

### Phase 1 — MVP Globe
- [ ] Render a 3D globe using `@react-three/fiber`.
- [ ] Add a static 2D grid texture to the globe's surface (can use procedural shader or simple image tiling).
- [ ] Add interactive Spheres as clickable nodes on the globe.
- [ ] Implement orbit controls (pan, zoom, rotate).
- [ ] Hover/click animation (glow or expand node).

### Phase 2 — Infinite Grid as Texture
- [ ] Build the infinite canvas separately using Pixi.js or Konva.
- [ ] Use an offscreen render or FBO (framebuffer object) to pipe this canvas into the globe as a texture (e.g. via a `CanvasTexture`).
- [ ] Sync user interactions (e.g. panning in the canvas updates the texture coordinates on the globe).

### Phase 3 — Click to Enter Sphere
- [ ] On Sphere click:
  - Animate zoom into that location.
  - Morph the perspective from spherical to flat (camera zoom + easing).
- [ ] At 1:1 zoom, transition to full 2D mode — unwrapping the infinite canvas fully.
- [ ] Maintain continuity — don't destroy/recreate DOM or scene.

### Phase 4 — In-Sphere Interaction
- [ ] Render apps, objects, and widgets on the grid canvas (notes, tasks, etc.).
- [ ] Implement drag/drop, zoom, nesting.
- [ ] Maintain breadcrumb or visual back to Globe view.

### Phase 5 — Advanced UI/UX Polish
- [ ] Apple Maps-style smooth camera transitions and easing.
- [ ] Subtle globe shaders: atmospheric glow, ambient light, spherical fog.
- [ ] Semantic clustering of spheres by domain or proximity.
- [ ] AI-augmented layout: auto-place nodes based on similarity.

---

## 🗺️ Design/UX Guidelines

- **Globe Feel**: smooth, weightless, tactile. Subtle inertia when rotating or zooming.
- **Grid Aesthetic**: transparent, elegant, minimal — not distracting but clearly structured.
- **Sphere Nodes**: expressive but abstract. Think of galaxy clusters, not folders.
- **Zoom Transitions**: must feel *inevitable*, natural — almost like physically diving into a world.

---

## 🧠 Key Concepts to Align On

- The **grid is always the same**, whether wrapped on the globe or flat in a Space.
- **Spheres are waypoints** — they do not "contain" spaces as much as *focus* the view onto one region of the grid.
- Navigation is **dimensional**: you move through scale and perspective, not through folders or views.
- The **Agent and Cortex** exist outside this view — but are accessible through interactions within spheres (e.g. invoking the agent brings up command/search overlays).

---

## 🧪 Experimental Ideas (Future)

- **Spherical heatmaps**: Agent highlights regions of the globe that are active or urgent.
- **Spatial memory trails**: Ghost paths of where you've been.
- **Collaborative globe**: Others appear on your globe in real time, like Figma cursors.
- **Temporal lens**: Slide through time to see how spheres evolved or changed.

---

## 🧩 File/Folder Structure (Simplified)

```bash
src/
  components/
    GlobeCanvas.tsx        # R3F-based globe view
    InfiniteGrid.tsx       # Pixi/Konva canvas
    SphereNode.tsx         # Each clickable Sphere
    VortexTransition.tsx   # Camera/perspective morph logic
  state/
    useVortexStore.ts      # Zustand or Valtio for shared state
  utils/
    sphereUtils.ts         # Sphere placement, mapping
    textureUtils.ts        # Grid-to-globe mapping
