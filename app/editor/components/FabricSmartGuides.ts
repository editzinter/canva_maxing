import { Canvas, FabricObject } from "fabric";

/**
 * Smooth Snapping Engine for Fabric.js
 * 
 * THE KEY TO PREVENTING VIBRATION:
 * ================================
 * The vibration happens because:
 * 1. We modify object.left/top based on getBoundingRect()
 * 2. Next frame, getBoundingRect() returns different values (because position changed)
 * 3. We calculate a different snap delta → feedback loop → vibration
 * 
 * SOLUTION:
 * Instead of reading the object's current position and modifying it,
 * we track the mouse position relative to drag start and calculate
 * where the object SHOULD be, then apply snap offset to that.
 * 
 * This way, the calculation is always based on mouse position (stable input),
 * not the object's position (which we're modifying).
 */
export const initSmartGuides = (canvas: Canvas) => {
    // Config
    const GUIDELINE_COLOR = "#ff4081";
    const GUIDELINE_WIDTH = 1;
    const SNAP_THRESHOLD = 10;

    // Drag state - this is the key to stable snapping
    interface DragState {
        active: boolean;
        objectStartLeft: number;
        objectStartTop: number;
        mouseStartX: number;
        mouseStartY: number;
        objectWidth: number;
        objectHeight: number;
    }

    const dragState: DragState = {
        active: false,
        objectStartLeft: 0,
        objectStartTop: 0,
        mouseStartX: 0,
        mouseStartY: 0,
        objectWidth: 0,
        objectHeight: 0,
    };

    // Active snap targets (for hysteresis)
    let activeSnapX: number | null = null;
    let activeSnapY: number | null = null;

    // Guidelines for rendering
    let guidelines: number[][] = [];

    // Page bounds for clipping (updated during object:moving)
    let clipBounds = { x: 0, y: 0, width: 595, height: 842 };

    // Render guides directly on context (fast) - with clipping to page
    const renderGuides = (opt: any) => {
        if (guidelines.length === 0) return;

        const ctx = opt.ctx as CanvasRenderingContext2D;
        const zoom = canvas.getZoom();

        ctx.save();

        // Apply clip region to keep guides inside the page
        ctx.beginPath();
        ctx.rect(clipBounds.x, clipBounds.y, clipBounds.width, clipBounds.height);
        ctx.clip();

        ctx.strokeStyle = GUIDELINE_COLOR;
        ctx.lineWidth = GUIDELINE_WIDTH / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);

        ctx.beginPath();
        for (const [x1, y1, x2, y2] of guidelines) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        ctx.restore();
    };

    // Capture initial state when drag starts
    const handleMouseDown = (e: any) => {
        const obj = e.target as FabricObject;
        if (!obj || (obj as any).isPageBackground) return;

        dragState.active = true;
        dragState.objectStartLeft = obj.left!;
        dragState.objectStartTop = obj.top!;
        dragState.objectWidth = obj.width! * obj.scaleX!;
        dragState.objectHeight = obj.height! * obj.scaleY!;

        // Get mouse position in scene coordinates
        const pointer = canvas.getScenePoint(e.e);
        dragState.mouseStartX = pointer.x;
        dragState.mouseStartY = pointer.y;

        activeSnapX = null;
        activeSnapY = null;
    };

    const handleObjectMoving = (e: any) => {
        const obj = e.target as FabricObject;
        if (!obj || !dragState.active) return;

        // Shift disables snapping
        if (e.e && e.e.shiftKey) {
            guidelines = [];
            activeSnapX = null;
            activeSnapY = null;
            return;
        }

        // Get current mouse position in scene coordinates
        const pointer = canvas.getScenePoint(e.e);
        const mouseX = pointer.x;
        const mouseY = pointer.y;

        // Calculate mouse movement delta
        const mouseDeltaX = mouseX - dragState.mouseStartX;
        const mouseDeltaY = mouseY - dragState.mouseStartY;

        // Calculate where the object WOULD be based on mouse movement
        // This is the "intended" position without any snapping
        const intendedLeft = dragState.objectStartLeft + mouseDeltaX;
        const intendedTop = dragState.objectStartTop + mouseDeltaY;

        // Object dimensions (cached from drag start)
        const w = dragState.objectWidth;
        const h = dragState.objectHeight;

        // Calculate edges based on intended position
        const intendedRight = intendedLeft + w;
        const intendedBottom = intendedTop + h;
        const intendedCenterX = intendedLeft + w / 2;
        const intendedCenterY = intendedTop + h / 2;

        // Collect snap targets
        const snapTargetsX: number[] = [];
        const snapTargetsY: number[] = [];

        // Page boundaries and center
        // Get page offset for multi-page support
        const pageId = (obj as any).pageId;
        let pageOffsetX = 0;
        let pageOffsetY = 0;

        // Find object's page offset (simplified - assumes pages are stacked vertically)
        const allObjects = canvas.getObjects();
        for (const o of allObjects) {
            if ((o as any).isPageBackground && (o as any).pageId === pageId) {
                pageOffsetX = o.left!;
                pageOffsetY = o.top!;
                break;
            }
        }

        // Page dimensions
        const pageWidth = 595;
        const pageHeight = 842;

        // Update clip bounds for guideline rendering
        clipBounds = { x: pageOffsetX, y: pageOffsetY, width: pageWidth, height: pageHeight };

        // Page-relative targets
        snapTargetsX.push(pageOffsetX); // Left edge
        snapTargetsX.push(pageOffsetX + pageWidth / 2); // Center
        snapTargetsX.push(pageOffsetX + pageWidth); // Right edge

        snapTargetsY.push(pageOffsetY); // Top edge
        snapTargetsY.push(pageOffsetY + pageHeight / 2); // Center
        snapTargetsY.push(pageOffsetY + pageHeight); // Bottom edge

        // Other objects as snap targets
        for (const target of allObjects) {
            if (target === obj) continue;
            if (!target.visible) continue;
            if ((target as any).isPageBackground || (target as any).excludeFromExport) continue;

            const tLeft = target.left!;
            const tTop = target.top!;
            const tWidth = target.width! * target.scaleX!;
            const tHeight = target.height! * target.scaleY!;

            snapTargetsX.push(tLeft); // Left
            snapTargetsX.push(tLeft + tWidth / 2); // Center
            snapTargetsX.push(tLeft + tWidth); // Right

            snapTargetsY.push(tTop); // Top
            snapTargetsY.push(tTop + tHeight / 2); // Center
            snapTargetsY.push(tTop + tHeight); // Bottom
        }

        // Find best X snap
        let bestSnapX: { offset: number; target: number } | null = null;
        let minDistX = SNAP_THRESHOLD;

        // Object edges to check
        const edgesX = [intendedLeft, intendedCenterX, intendedRight];
        const edgeOffsetsX = [0, w / 2, w]; // Distance from left edge

        for (let i = 0; i < edgesX.length; i++) {
            const edge = edgesX[i];
            for (const target of snapTargetsX) {
                const dist = Math.abs(edge - target);

                // Apply hysteresis: if already snapped, use larger threshold
                const threshold = (activeSnapX === target) ? SNAP_THRESHOLD * 1.5 : SNAP_THRESHOLD;

                if (dist < threshold && dist < minDistX) {
                    minDistX = dist;
                    // Calculate offset to align this edge with target
                    bestSnapX = {
                        offset: target - edge,
                        target: target
                    };
                }
            }
        }

        // Find best Y snap
        let bestSnapY: { offset: number; target: number } | null = null;
        let minDistY = SNAP_THRESHOLD;

        const edgesY = [intendedTop, intendedCenterY, intendedBottom];

        for (let i = 0; i < edgesY.length; i++) {
            const edge = edgesY[i];
            for (const target of snapTargetsY) {
                const dist = Math.abs(edge - target);
                const threshold = (activeSnapY === target) ? SNAP_THRESHOLD * 1.5 : SNAP_THRESHOLD;

                if (dist < threshold && dist < minDistY) {
                    minDistY = dist;
                    bestSnapY = {
                        offset: target - edge,
                        target: target
                    };
                }
            }
        }

        // Calculate final position
        const snapOffsetX = bestSnapX ? bestSnapX.offset : 0;
        const snapOffsetY = bestSnapY ? bestSnapY.offset : 0;

        const finalLeft = intendedLeft + snapOffsetX;
        const finalTop = intendedTop + snapOffsetY;

        // Apply position with rounding to prevent sub-pixel jitter
        obj.set({
            left: Math.round(finalLeft * 10) / 10,
            top: Math.round(finalTop * 10) / 10,
        });
        obj.setCoords();

        // Update active snap state
        activeSnapX = bestSnapX ? bestSnapX.target : null;
        activeSnapY = bestSnapY ? bestSnapY.target : null;

        // Draw guidelines - constrained to page boundaries
        guidelines = [];

        if (bestSnapX) {
            // Vertical line - clip to page bounds
            const guideX = bestSnapX.target;
            const yStart = Math.max(pageOffsetY, pageOffsetY);
            const yEnd = Math.min(pageOffsetY + pageHeight, pageOffsetY + pageHeight);
            guidelines.push([guideX, yStart, guideX, yEnd]);
        }

        if (bestSnapY) {
            // Horizontal line - clip to page bounds
            const guideY = bestSnapY.target;
            const xStart = Math.max(pageOffsetX, pageOffsetX);
            const xEnd = Math.min(pageOffsetX + pageWidth, pageOffsetX + pageWidth);
            guidelines.push([xStart, guideY, xEnd, guideY]);
        }
    };

    const handleMouseUp = () => {
        dragState.active = false;
        activeSnapX = null;
        activeSnapY = null;
        guidelines = [];
        canvas.requestRenderAll();
    };

    // Listen for selection changes to reset state
    const handleSelectionCleared = () => {
        dragState.active = false;
        guidelines = [];
    };

    // Attach listeners
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("after:render", renderGuides);

    return () => {
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("object:moving", handleObjectMoving);
        canvas.off("mouse:up", handleMouseUp);
        canvas.off("selection:cleared", handleSelectionCleared);
        canvas.off("after:render", renderGuides);
    };
};
