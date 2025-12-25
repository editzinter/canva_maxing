# Specification: Deep Research & Re-Architecting Canvas Interaction

## 1. Overview
This track focuses on elevating the core canvas experience to match the fluidity and intuitive nature of Canva. It begins with a deep research phase to deconstruct Canva's interaction model (zooming, panning, selection, multi-page handling) and compares it with our current Fabric.js implementation. The goal is to refactor the editor to support a robust, multi-page architecture and resolve existing interaction bugs.

## 2. Objectives
-   **Deep Analysis:** Document specific interaction patterns in Canva (e.g., how selection handles scale, how pages are rendered vs. the viewport).
-   **Bug Resolution:** Identify and fix the root causes of current canvas bugs (specifically adding pages and interaction glitches).
-   **Architecture Upgrade:** Refactor the Fabric.js implementation to support a true multi-page document model, not just a single infinite canvas or hacked-together view.
-   **UX Polish:** Implement "Invisible UX" principles—smooth zooming, intuitive panning, and context-aware controls.

## 3. User Stories
-   As a user, I want to zoom in and out of my design smoothly using scroll or gestures, centered on my cursor, just like in Canva.
-   As a user, I want to see multiple pages of my document laid out vertically or in a grid, and easily move elements between them.
-   As a user, I want to select multiple objects across different layers without selecting the background or locked elements accidentally.
-   As a developer, I need a clean, modular way to manage canvas state so that adding new pages doesn't break existing logic.

## 4. Technical Requirements
-   **Library:** Continue using Fabric.js but leverage advanced features (viewport transformations, custom controls).
-   **State Management:** Ensure the React state (Next.js) stays in sync with the imperative Fabric.js canvas state.
-   **Performance:** Canvas operations (pan/zoom) must run at 60fps.
- **Multi-Page Model:**
    - **Decision:** Multiple Fabric instances (one per page) wrapped in a CSS-transformed Workspace.
    - **Zooming:** Use CSS `transform: scale()` on the workspace container for 60fps performance.
    - **Ref Management:** Implement a stable `CanvasRegistry` to avoid ref-proxy sync issues.

## 5. Constraints
-   Must maintain existing file structure conventions.
-   No regression on existing functional features (e.g., image export must still work).
