# RFC: Canvas Architecture for Multi-Page Support

## 1. Problem Statement
The current implementation of the multi-page editor is unstable. It uses multiple Fabric.js instances but suffers from ref synchronization issues, brittle page-switching logic, and poor zooming performance due to imperative canvas resizing. We need a robust architecture that scales to many pages while providing a fluid, "Canva-like" user experience.

## 2. Proposed Options

### Option A: Single Fabric Canvas with "Virtual Pages"
- **Concept:** One massive Fabric canvas that renders all pages as "Group" objects or offset regions.
- **Pros:**
    - Single imperative state to manage.
    - Native Fabric dragging between "pages."
- **Cons:**
    - Performance scales poorly as canvas size increases (browser limits on canvas width/height).
    - Extremely complex coordinate math for UI overlays and selection.
    - Loss of native DOM scrolling for pages.

### Option B: Multiple Fabric Instances (Refined Canva Model) - **RECOMMENDED**
- **Concept:** One Fabric `Canvas` instance per page, wrapped in a React `Page` component. A central `Workspace` component manages global Zoom/Pan using CSS transforms.
- **Pros:**
    - **Isolation:** Each page is a self-contained unit. Bug on Page 1 doesn't affect Page 2.
    - **Performance:** Leverages browser GPU for zooming/panning via CSS `scale()`/`translate()`.
    - **Native Layout:** Pages can be laid out using Flexbox/Grid and scrolled natively.
    - **Familiarity:** Aligns with how Canva and Figma manage their workspace (DOM nodes for pages).
- **Cons:**
    - Memory overhead (mitigated by lazy-loading/disposing off-screen canvases).
    - Complex event propagation (dragging elements *between* separate canvases).

## 3. Implementation Strategy for Option B

### 3.1 Workspace & Zooming
- Create a `Workspace` component that wraps all pages.
- Use a single CSS `transform` on the `PageContainer` for zooming.
- This removes the need to call `canvas.setZoom()` and `canvas.setDimensions()` on every single Fabric instance during zoom.

### 3.2 Ref Management (The "Registry" Pattern)
- Replace the current "Proxy Ref" prop with a `CanvasRegistry` (Context or a stable Hook).
- Use a unique, sanitized `pageId` for each canvas.
- Components access the `activeCanvas` through a clean `useActiveCanvas()` hook.

### 3.3 Event Centralization
- Move `window` event listeners (Zoom, Pan, Shortcuts) to the `Workspace` level.
- Use event delegation or coordinates to determine which `FabricCanvas` instance should receive the command.

## 4. Decision
We will proceed with **Option B (Refined Multiple Instances)**. This path leverages the existing investment in Fabric.js while fixing the fundamental architectural flaws identified in the audit.
