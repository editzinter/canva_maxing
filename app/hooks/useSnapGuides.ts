import { useState, useCallback } from 'react';

export interface Rect {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SnapLine {
    orientation: 'vertical' | 'horizontal';
    position: number;
}

// Pure logic for snapping
export function calculateSnap(
    currentRect: Omit<Rect, 'id'>,
    otherRects: Rect[],
    threshold: number = 8,
    canvasWidth: number = 595,
    canvasHeight: number = 842
) {
    let newX = currentRect.x;
    let newY = currentRect.y;
    const activeGuides: SnapLine[] = [];

    // Points of interest on the current rect
    const current = {
        left: currentRect.x,
        center: currentRect.x + currentRect.width / 2,
        right: currentRect.x + currentRect.width,
        top: currentRect.y,
        middle: currentRect.y + currentRect.height / 2,
        bottom: currentRect.y + currentRect.height,
    };

    // --- HORIZONTAL GUIDES (affect Y) ---
    let closestDy = threshold + 1;
    let targetGuideY: number | null = null;

    const checkY = (curr: number, target: number) => {
        const d = target - curr;
        if (Math.abs(d) < Math.abs(closestDy)) {
            closestDy = d;
            targetGuideY = target;
        }
    };

    // 1. Canvas Edges (Top, Center, Bottom)
    checkY(current.top, 0);
    checkY(current.middle, canvasHeight / 2);
    checkY(current.bottom, canvasHeight);

    // 2. Others
    for (const other of otherRects) {
        const otherTop = other.y;
        const otherMid = other.y + other.height / 2;
        const otherBot = other.y + other.height;

        // Snap Top to Top/Bottom
        checkY(current.top, otherTop);
        checkY(current.top, otherBot);

        // Snap Bottom to Top/Bottom
        checkY(current.bottom, otherTop);
        checkY(current.bottom, otherBot);

        // Snap Center to Center
        checkY(current.middle, otherMid);
    }

    if (Math.abs(closestDy) <= threshold) {
        newY += closestDy;
        if (targetGuideY !== null) activeGuides.push({ orientation: 'horizontal', position: targetGuideY });
    }

    // --- VERTICAL GUIDES (affect X) ---
    let closestDx = threshold + 1;
    let targetGuideX: number | null = null;

    const checkX = (curr: number, target: number) => {
        const d = target - curr;
        if (Math.abs(d) < Math.abs(closestDx)) {
            closestDx = d;
            targetGuideX = target;
        }
    };

    // 1. Canvas Edges (Left, Center, Right)
    checkX(current.left, 0);
    checkX(current.center, canvasWidth / 2);
    checkX(current.right, canvasWidth);

    // 2. Others
    for (const other of otherRects) {
        const otherLeft = other.x;
        const otherCenter = other.x + other.width / 2;
        const otherRight = other.x + other.width;

        checkX(current.left, otherLeft);
        checkX(current.left, otherRight);
        checkX(current.right, otherLeft);
        checkX(current.right, otherRight);
        checkX(current.center, otherCenter);
    }

    if (Math.abs(closestDx) <= threshold) {
        newX += closestDx;
        if (targetGuideX !== null) activeGuides.push({ orientation: 'vertical', position: targetGuideX });
    }

    // Dedupe
    const uniqueGuides = Array.from(new Set(activeGuides.map(g => JSON.stringify(g)))).map(s => JSON.parse(s));

    return { x: newX, y: newY, guides: uniqueGuides as SnapLine[] };
}

export function useSnapGuides() {
    const [guides, setGuides] = useState<SnapLine[]>([]);

    const updateGuides = useCallback((newGuides: SnapLine[]) => {
        setGuides(newGuides);
    }, []);

    const clearGuides = useCallback(() => setGuides([]), []);

    return {
        guides,
        updateGuides,
        clearGuides
    };
}
