# Architecture Decision Record (ADR): Multi-Page Canvas Model

## Status: Accepted

## Decision
We will implement the **Refined Multiple Canvas Instances** model for the editor.

## Context
Our goal is a "Canva-like" experience. Previous attempts at multi-page support were buggy due to unstable ref management and imperative zooming. We evaluated two prototypes:
1. **Virtual Pages (Single Canvas):** Native dragging between pages but complex math and performance risks.
2. **Multiple Instances (CSS Zoom):** Isolated pages, high performance zooming via GPU, and simpler state management.

## Consequences
- **Zooming:** Will be handled by `transform: scale()` on a workspace wrapper.
- **State:** Fabric instances will be stored in a centralized registry accessed via React context/hooks.
- **IDs:** Page IDs must be sanitized (no spaces).
- **Inter-Page Dragging:** Requires custom event handling to transfer objects between instances (using `toJSON` and `add`).

## Comparison to Legacy
The legacy code tried to do "Multiple Instances" but incorrectly used `setZoom` and `setDimensions` on the canvas objects themselves, causing recalculation overhead and layout shifts. The new model stabilizes the canvas dimensions and uses the browser's native scaling.
