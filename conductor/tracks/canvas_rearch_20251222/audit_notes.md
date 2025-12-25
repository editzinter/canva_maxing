# Codebase Audit: Editor & Canvas

## 1. State Management
- **Hybrid Model:** Uses React state for document structure (`pages` array) and imperative Fabric.js instances for content.
- **Reference Mapping:** `canvasRefs.current` in the main page stores all Fabric instances by page ID.
- **The "Proxy Ref" Pattern:** The main page passes a getter/setter object as a `canvasRef` prop to each `FabricCanvas`. 
    - *Issue:* This object is re-created on every render, which is an anti-pattern for Refs and can cause unnecessary effect triggers in children.

## 2. Identified Bugs & Bottlenecks

### A. "Adding Pages" Instability
- **ID Formatting:** Page IDs are generated with spaces: `` `page - ${Date.now()} ` ``. This is prone to matching errors.
- **Race Conditions:** `FabricCanvas` uses a `setTimeout` to trigger `onReady`. If multiple pages are added quickly, `activeCanvasRef` updates might become out of sync.
- **Resource Heavy:** Adding a page mounts a full `FabricCanvas` component which initializes a new heavy Fabric `Canvas` instance and attaches multiple global event listeners (like `keydown`).

### B. Zooming Performance
- **Imperative Resize:** Zooming calls `canvas.setDimensions` on every Fabric instance. 
    - *Performance:* This forces the browser to resize the HTML canvas element and Fabric to recalculate all object positions/scaling.
    - *Comparison:* Canva uses CSS transforms on a wrapper, which is GPU-accelerated and doesn't require resizing the canvas buffer.

### C. Event Listener Leaks
- **Global Listeners:** `FabricCanvas` attaches a `keydown` listener to `window`.
    - *Issue:* If there are 10 pages, there are 10 `keydown` listeners on `window`, all trying to delete objects on their respective canvases. This can lead to multiple deletions or unexpected behavior if not carefully guarded by `isActive`.

### D. Multi-page Architecture (or lack thereof)
- **Flat List Rendering:** Every page is rendered in a single scrollable list.
- **No Virtualization:** With many pages, the number of active Fabric instances and DOM nodes will degrade performance significantly.
- **Isolation Issues:** While some effort is made to `discardActiveObject` on switch, the state sharing via `activeCanvasRef` proxy is brittle.

## 3. Recommendations for Re-Architecture
1. **Sanitize IDs:** Use URL-safe, space-free IDs (e.g., `page_${Date.now()}`).
2. **Centralize Event Handling:** Move `window` level listeners to a single `Workspace` component instead of each `FabricCanvas`.
3. **CSS-Based Zooming:** Implement zoom using `transform: scale()` on a workspace wrapper.
4. **Stable Refs:** Use a standard `useRef` or a stable registry for canvas instances.
5. **Multi-Instance Guard:** Ensure `FabricCanvas` only attaches its listeners and renders when necessary (or use a shared "active" canvas with virtual swapping if performance becomes critical).
