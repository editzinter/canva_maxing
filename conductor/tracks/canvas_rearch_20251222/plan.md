# Plan: Deep Research & Re-Architecting Canvas Interaction

## Phase 1: Research & Discovery
- [x] Task: Conduct specific research on Canva's canvas DOM and event listeners. Analyze how they handle zooming (CSS transform vs Canvas scale) and multi-page rendering. Document findings in `conductor/tracks/canvas_rearch_20251222/research_notes.md`. [59afc33]
- [x] Task: Audit the current `app/editor` codebase. Map out the current state management for the canvas and identify the specific code blocks causing the "adding pages" bugs. [01f178a]
- [x] Task: Create a technical proposal RFC comparing "Single Canvas with Virtual Pages" vs "Multiple Canvas Instances" for our specific stack (Next.js + Fabric.js). [2e506a2]

## Phase 2: Architecture & Prototyping [checkpoint: 4c4b512]
- [x] Task: Create a minimal reproduction/prototype of the "Virtual Pages" approach using Fabric.js to test performance and cross-page element dragging. [dd44066]
- [x] Task: Create a minimal reproduction/prototype of the "Multiple Canvas Instances" approach to test state synchronization. [56590e2]
- [x] Task: Select the architecture and document the decision. [2beccd5]
- [x] Task: Conductor - User Manual Verification 'Architecture & Prototyping' (Protocol in workflow.md) [6b580eb]

## Phase 3: Core Refactoring (The Foundation) [checkpoint: 252b283]
- [x] Task: Refactor the main Editor component to decouple the Canvas initialization logic from the UI layout. [61b5a73]
- [x] Task: Implement the chosen Multi-Page Architecture. (TDD: Write tests for page creation/deletion state logic first). [68d18ac]
- [x] Task: Re-implement Zoom and Pan logic to match the "Canva feel" (smooth cursor-centered zoom). [fb14490]
- [x] Task: Conductor - User Manual Verification 'Core Refactoring' (Protocol in workflow.md) [2803372]

## Phase 4: Interaction Polish & Bug Fixes [checkpoint: a550bd8]
- [x] Task: Fix the specific bugs related to adding pages (ensure new pages render correctly and are interactive immediately). [c3c1db0]
- [x] Task: Refine object selection logic (implement "deep selection" or proper event propagation prevention). [2c12ab1]
- [x] Task: Implement smooth scrolling/panning for the workspace container. [fb14490]
- [x] Task: Conductor - User Manual Verification 'Interaction Polish & Bug Fixes' (Protocol in workflow.md) [a550bd8]

## Phase 5: Final Verification & Performance Tuning
- [x] Task: Fix Zoom Shakiness (Remove CSS transition conflict with scroll updates). [24d4206]
- [x] Task: Optimize Assets Tab performance (Implement virtualization or pagination to prevent lag). [658c273]
- [x] Task: Verify functionality of all Editor buttons (Toolbar, Export, etc.).
- [x] Task: Verify the full workflow: Create Document -> Add Pages -> Move Elements -> Export.
- [x] Task: Run full regression tests on existing features.
