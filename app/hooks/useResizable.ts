import { useState, useRef, useCallback } from 'react';

export type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

interface UseResizableProps {
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number | null; // number or null
    onResize: (updates: { x: number; y: number; width: number; height: number }) => void;
    onResizeEnd?: () => void;
}

export function useResizable({
    initialWidth,
    initialHeight,
    initialX,
    initialY,
    minWidth = 10,
    minHeight = 10,
    aspectRatio = null,
    onResize,
    onResizeEnd
}: UseResizableProps) {
    const resizingState = useRef<{
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
        startXPos: number;
        startYPos: number;
        direction: ResizeDirection;
    } | null>(null);

    const startResize = useCallback((direction: ResizeDirection, e: React.PointerEvent | React.MouseEvent) => {
        // We use Pointer Events if available
        e.preventDefault();
        e.stopPropagation();

        const clientX = 'clientX' in e ? e.clientX : (e as any).touches?.[0].clientX;
        const clientY = 'clientY' in e ? e.clientY : (e as any).touches?.[0].clientY;

        resizingState.current = {
            startX: clientX,
            startY: clientY,
            startWidth: initialWidth,
            startHeight: initialHeight,
            startXPos: initialX,
            startYPos: initialY,
            direction
        };
        console.log('Resize Started', direction, resizingState.current);

        const handlePointerMove = (moveEvent: PointerEvent) => {
            if (!resizingState.current) return;
            // console.log('Resize Move', moveEvent.clientX);
            const { startX, startY, startWidth, startHeight, startXPos, startYPos, direction } = resizingState.current;

            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startXPos;
            let newY = startYPos;

            // 1. Calculate new Dimensions based on direction
            if (direction.includes('e')) {
                newWidth = Math.max(minWidth, startWidth + deltaX);
            }
            if (direction.includes('w')) {
                const potentialWidth = Math.max(minWidth, startWidth - deltaX);
                newWidth = potentialWidth;
                newX = startXPos - (newWidth - startWidth);
            }

            if (direction.includes('s')) {
                newHeight = Math.max(minHeight, startHeight + deltaY);
            }
            if (direction.includes('n')) {
                const potentialHeight = Math.max(minHeight, startHeight - deltaY);
                newHeight = potentialHeight;
                newY = startYPos - (newHeight - startHeight);
            }

            // 2. Aspect Ratio Constraint (Simplistic)
            if (aspectRatio && direction.length === 2) {
                const targetHeight = newWidth / aspectRatio;
                const heightDiff = targetHeight - newHeight;
                newHeight = targetHeight;

                if (direction.includes('n')) {
                    newY = startYPos - (newHeight - startHeight);
                }
            }

            onResize({ x: newX, y: newY, width: newWidth, height: newHeight });
        };

        const handlePointerUp = () => {
            if (resizingState.current) {
                onResizeEnd?.();
            }
            resizingState.current = null;
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }, [initialWidth, initialHeight, initialX, initialY, minWidth, minHeight, aspectRatio, onResize, onResizeEnd]);

    return { startResize };
}
