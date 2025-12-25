"use client";

import React, { createContext, useContext, useRef, useState, useCallback } from "react";
import { Canvas } from "fabric";

interface CanvasContextType {
    registerCanvas: (id: string, canvas: Canvas) => void;
    unregisterCanvas: (id: string) => void;
    getCanvas: (id: string) => Canvas | undefined;
    activeCanvasId: string | null;
    setActiveCanvasId: (id: string | null) => void;
    activeCanvas: Canvas | null;
    recalculateOffsets: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
    const canvasMap = useRef<Map<string, Canvas>>(new Map());
    const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
    const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);

    const registerCanvas = useCallback((id: string, canvas: Canvas) => {
        canvasMap.current.set(id, canvas);
        // If it's the first canvas or matches active ID, set as active
        if (id === activeCanvasId || canvasMap.current.size === 1) {
            setActiveCanvasId(id);
            setActiveCanvas(canvas);
        }
    }, [activeCanvasId]);

    const unregisterCanvas = useCallback((id: string) => {
        canvasMap.current.delete(id);
        if (activeCanvasId === id) {
            setActiveCanvasId(null);
            setActiveCanvas(null);
        }
    }, [activeCanvasId]);

    const getCanvas = useCallback((id: string) => {
        return canvasMap.current.get(id);
    }, []);

    const updateActiveCanvas = useCallback((id: string | null) => {
        setActiveCanvasId(id);
        setActiveCanvas(id ? (canvasMap.current.get(id) || null) : null);
    }, []);

    const recalculateOffsets = useCallback(() => {
        canvasMap.current.forEach((canvas) => {
            canvas.calcOffset();
        });
    }, []);

    return (
        <CanvasContext.Provider value={{
            registerCanvas,
            unregisterCanvas,
            getCanvas,
            activeCanvasId,
            setActiveCanvasId: updateActiveCanvas,
            activeCanvas,
            recalculateOffsets
        }}>
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error("useCanvas must be used within a CanvasProvider");
    }
    return context;
}
