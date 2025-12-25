# Research Notes: Canva Editor Architecture

## 1. Core Rendering Strategy
- **Hybrid Approach:** Canva uses a sophisticated mix of DOM, SVG, and Canvas.
- **DOM for Layout:** Each page is a distinct DOM node (`div`) within a scrollable workspace container. This allows for native browser scrolling, accessibility, and easier multi-page management.
- **Canvas/SVG for Content:** Individual elements on a page are rendered as SVG (for vectors) or on an internal canvas.
- **Benefit:** This avoids the "infinite canvas" complexity where a single massive canvas becomes a performance bottleneck.

## 2. Zooming and Panning
- **CSS Transforms:** Zooming is primarily handled by applying `transform: scale()` to the `workspace` or `page-container`.
- **Coordinate Space:** By scaling the container, Canva keeps the coordinate math within each page relative to the page size (e.g., a 100x100 box is always 100x100 on that page, regardless of zoom).
- **Sub-pixel Rendering:** Modern browsers handle CSS scaling of SVG/Text very well, maintaining sharpness.
- **Panning:** Handled by standard scroll mechanisms (overflow: scroll) or `translate()` transforms on the wrapper.

## 3. Multi-page Architecture
- **Distinct Instances:** Each page acts as an isolated design unit.
- **Global State:** A central store (likely MobX or Redux) tracks all pages and their contents.
- **Lazy Loading:** Pages not in the viewport can be unmounted or replaced with low-res thumbnails to save memory.
- **Inter-page Interaction:** Dragging an element from Page 1 to Page 2 involves detecting the "drop" target page and moving the data from Page 1's array to Page 2's array in the global state.

## 4. Event Handling and Selection
- **Global Listener:** A top-level event listener on the workspace captures mouse/touch events.
- **Hit Testing:** When a click occurs, the app determines which page was clicked, then which element within that page (using bounding box checks).
- **Selection UI:** Selection handles (resize, rotate) are often rendered on a "UI layer" above the actual canvas content to ensure they stay crisp and interactive.

## 5. Application to our Project (Fabric.js)
- **Current Problem:** We might be trying to squeeze everything into one Fabric canvas or handling pages poorly.
- **Proposed Shift:** 
    - Move to a **"One Fabric Instance per Page"** model.
    - Wrap each Fabric canvas in a React component representing a Page.
    - Use a shared `Workspace` component that handles global Zoom/Pan via CSS transforms on the pages wrapper.
