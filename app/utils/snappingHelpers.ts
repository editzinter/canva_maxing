import { Canvas, FabricObject, Line, Point } from "fabric";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../editor/components/FabricCanvas";

const SNAP_DIST = 10; // Pixels
const GUIDE_COLOR = "#ff0077"; // Magenta
const GUIDE_WIDTH = 1;

interface SnapState {
    vLine: Line | null;
    hLine: Line | null;
}

// Singleton state to track guides (so we don't recreate them constantly)
const snapState: SnapState = {
    vLine: null,
    hLine: null
};

export const clearGuidelines = (canvas: Canvas) => {
    if (snapState.vLine) {
        canvas.remove(snapState.vLine);
        snapState.vLine = null;
    }
    if (snapState.hLine) {
        canvas.remove(snapState.hLine);
        snapState.hLine = null;
    }
    canvas.requestRenderAll();
};

const drawGuide = (canvas: Canvas, x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal') => {
    const lineProps = {
        stroke: GUIDE_COLOR,
        strokeWidth: GUIDE_WIDTH,
        selectable: false,
        evented: false,
        strokeDashArray: [4, 4],
        opacity: 0.8
    };

    if (type === 'vertical') {
        if (snapState.vLine) canvas.remove(snapState.vLine);
        snapState.vLine = new Line([x1, y1, x2, y2], lineProps);
        canvas.add(snapState.vLine);
    } else {
        if (snapState.hLine) canvas.remove(snapState.hLine);
        snapState.hLine = new Line([x1, y1, x2, y2], lineProps);
        canvas.add(snapState.hLine);
    }
};

export const handleObjectMoving = (canvas: Canvas, obj: FabricObject) => {
    const w = obj.width! * obj.scaleX!;
    const h = obj.height! * obj.scaleY!;

    // Calculate Object Edges (Current Position)
    // Note: Fabric objects use center origin often, but we need bounds.
    // We assume originX/Y might be center or left/top. 
    // We assume originX/Y might be center or left/top.
    // Best to get bounding rect.
    // getBoundingRect depends on viewport, we want absolute coords.
    // Actually obj.left/top depends on origin.
    // Let's normalize to Center coordinates for comparison
    const centerX = obj.getCenterPoint().x;
    const centerY = obj.getCenterPoint().y;

    // Edges
    const left = centerX - w / 2;
    const right = centerX + w / 2;
    const top = centerY - h / 2;
    const bottom = centerY + h / 2;

    let snappedX = false;
    let snappedY = false;

    // 1. Snap to Canvas Center
    if (Math.abs(centerX - CANVAS_WIDTH / 2) < SNAP_DIST) {
        obj.setPositionByOrigin(new Point(CANVAS_WIDTH / 2, centerY), 'center', 'center');
        drawGuide(canvas, CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT, 'vertical');
        snappedX = true;
    }

    if (Math.abs(centerY - CANVAS_HEIGHT / 2) < SNAP_DIST) {
        obj.setPositionByOrigin(new Point(obj.getCenterPoint().x, CANVAS_HEIGHT / 2), 'center', 'center'); // Use updated X
        drawGuide(canvas, 0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2, 'horizontal');
        snappedY = true;
    }

    // If snapped to center, skip checking others for that axis to avoid jitter? 
    // Or allow snapping to objects if they are closer? Canva prioritizes center usually.

    if (!snappedX || !snappedY) {
        canvas.getObjects().forEach(target => {
            if (target === obj) return;
            if (target.type === 'line') return; // Don't snap to guides
            if (target.containsPoint(new Point(centerX, centerY))) return; // Optimization?

            // Target Metrics
            const tW = target.width! * target.scaleX!;
            const tH = target.height! * target.scaleY!;
            const tCenter = target.getCenterPoint();
            const tLeft = tCenter.x - tW / 2;
            const tRight = tCenter.x + tW / 2;
            const tTop = tCenter.y - tH / 2;
            const tBottom = tCenter.y + tH / 2;

            // X-AXIS SNAPPING
            if (!snappedX) {
                // Center-Center
                if (Math.abs(centerX - tCenter.x) < SNAP_DIST) {
                    obj.setPositionByOrigin(new Point(tCenter.x, obj.getCenterPoint().y), 'center', 'center');
                    drawGuide(canvas, tCenter.x, Math.min(top, tTop), tCenter.x, Math.max(bottom, tBottom), 'vertical');
                    snappedX = true;
                }
                // Left-Left
                else if (Math.abs(left - tLeft) < SNAP_DIST) {
                    // Move obj so its left equals tLeft
                    const newCenterX = tLeft + w / 2;
                    obj.setPositionByOrigin(new Point(newCenterX, obj.getCenterPoint().y), 'center', 'center');
                    drawGuide(canvas, tLeft, Math.min(top, tTop), tLeft, Math.max(bottom, tBottom), 'vertical');
                    snappedX = true;
                }
                // Right-Right
                else if (Math.abs(right - tRight) < SNAP_DIST) {
                    const newCenterX = tRight - w / 2;
                    obj.setPositionByOrigin(new Point(newCenterX, obj.getCenterPoint().y), 'center', 'center');
                    drawGuide(canvas, tRight, Math.min(top, tTop), tRight, Math.max(bottom, tBottom), 'vertical');
                    snappedX = true;
                }
            }

            // Y-AXIS SNAPPING
            if (!snappedY) {
                // Center-Center
                if (Math.abs(centerY - tCenter.y) < SNAP_DIST) {
                    obj.setPositionByOrigin(new Point(obj.getCenterPoint().x, tCenter.y), 'center', 'center');
                    drawGuide(canvas, Math.min(left, tLeft), tCenter.y, Math.max(right, tRight), tCenter.y, 'horizontal');
                    snappedY = true;
                }
                // Top-Top
                else if (Math.abs(top - tTop) < SNAP_DIST) {
                    const newCenterY = tTop + h / 2;
                    obj.setPositionByOrigin(new Point(obj.getCenterPoint().x, newCenterY), 'center', 'center');
                    drawGuide(canvas, Math.min(left, tLeft), tTop, Math.max(right, tRight), tTop, 'horizontal');
                    snappedY = true;
                }
                // Bottom-Bottom
                else if (Math.abs(bottom - tBottom) < SNAP_DIST) {
                    const newCenterY = tBottom - h / 2;
                    obj.setPositionByOrigin(new Point(obj.getCenterPoint().x, newCenterY), 'center', 'center');
                    drawGuide(canvas, Math.min(left, tLeft), tBottom, Math.max(right, tRight), tBottom, 'horizontal');
                    snappedY = true;
                }
            }
        });
    }

    if (!snappedX && snapState.vLine) {
        canvas.remove(snapState.vLine);
        snapState.vLine = null;
    }
    if (!snappedY && snapState.hLine) {
        canvas.remove(snapState.hLine);
        snapState.hLine = null;
    }

    // We don't renderAll here excessively? Fabric handles moving render. 
    // But we added guides so we might need to.
    // canvas.requestRenderAll(); 
};
