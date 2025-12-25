"use client";

import { useEffect } from "react";
import { Canvas, Textbox } from "fabric";

export function useEditorShortcuts(canvas: Canvas | null) {
    useEffect(() => {
        if (!canvas) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const activeObject = canvas.getActiveObject();
            if (!activeObject) return;

            // Don't handle if editing text
            if (activeObject instanceof Textbox && (activeObject as any).isEditing) {
                return;
            }

            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                canvas.remove(activeObject);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }

            if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                activeObject.clone().then((cloned: any) => {
                    cloned.set({
                        left: (activeObject.left || 0) + 20,
                        top: (activeObject.top || 0) + 20,
                    });
                    canvas.add(cloned);
                    canvas.setActiveObject(cloned);
                    canvas.requestRenderAll();
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canvas]);
}
