"use client";

import React, { useEffect, useState, useRef } from "react";
import { Copy, Trash2, ArrowUp, ArrowDown, Layers } from "lucide-react";
import { Canvas, FabricObject } from "fabric";

interface FabricSelectionMenuProps {
    canvas: Canvas | null;
    activeObject: FabricObject | null;
    zoom: number;
    onModified?: () => void;
}

export function FabricSelectionMenu({
    canvas,
    activeObject,
    zoom,
    onModified,
}: FabricSelectionMenuProps) {
    const [position, setPosition] = useState({ top: 0, left: 0, visible: false });
    const menuRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!activeObject || !canvas) {
            setPosition((p) => ({ ...p, visible: false }));
            return;
        }

        // Get absolute coordinates
        const boundingRect = activeObject.getBoundingRect();

        // Get viewport transform properties for Pan support
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const panX = vpt[4];
        const panY = vpt[5];

        // Calculate Screen Coordinates
        // X: (LogicalCenter * Zoom) + PanX
        // Y: (LogicalTop * Zoom) + PanY
        const logicalCenterX = boundingRect.left + boundingRect.width / 2;
        const logicalTopY = boundingRect.top;

        const left = (logicalCenterX * zoom) + panX;
        const top = (logicalTopY * zoom) + panY - 20; // 20px padding above object

        setPosition({
            top,
            left,
            visible: true,
        });
    };

    useEffect(() => {
        if (!canvas || !activeObject) {
            setPosition((p) => ({ ...p, visible: false }));
            return;
        }

        // Update initially
        updatePosition();

        // Listen for object interaction to HIDE menu
        const handleInteraction = () => {
            setPosition((p) => ({ ...p, visible: false }));
        };

        // Listen for interaction END to SHOW menu
        const handleInteractionEnd = () => {
            updatePosition();
        };

        // Fabric v6 events
        activeObject.on("moving", handleInteraction);
        activeObject.on("scaling", handleInteraction);
        activeObject.on("rotating", handleInteraction);
        activeObject.on("resizing", handleInteraction);

        // 'modified' fires when the user releases the mouse after a transform
        activeObject.on("modified", handleInteractionEnd);

        // Global transform events for pan/zoom
        const handleGlobalTransform = () => {
            updatePosition();
        };

        canvas.on("mouse:wheel", handleGlobalTransform);
        canvas.on("mouse:move", handleGlobalTransform); // For Panning

        return () => {
            activeObject.off("moving", handleInteraction);
            activeObject.off("scaling", handleInteraction);
            activeObject.off("rotating", handleInteraction);
            activeObject.off("resizing", handleInteraction);
            activeObject.off("modified", handleInteractionEnd);

            canvas.off("mouse:wheel", handleGlobalTransform);
            canvas.off("mouse:move", handleGlobalTransform);
        };
    }, [canvas, activeObject, zoom]);

    // Actions
    const handleDuplicate = async () => {
        if (!canvas || !activeObject) return;

        const cloned = await activeObject.clone();
        canvas.discardActiveObject();

        cloned.set({
            left: (activeObject.left || 0) + 20,
            top: (activeObject.top || 0) + 20,
            evented: true,
        });

        if (cloned instanceof FabricObject) {
            // Type check safety
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            onModified?.();
        }
    };

    const handleDelete = () => {
        if (!canvas || !activeObject) return;
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        onModified?.();
    };

    const handleBringForward = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas || !activeObject) return;

        const objects = canvas.getObjects();

        // Find texture overlay index
        const textureIndex = objects.findIndex(
            (obj) => (obj as any).customId === "texture-overlay",
        );
        const maxIndex = textureIndex >= 0 ? textureIndex - 1 : objects.length - 1;

        if (activeObject.type === "activeSelection") {
            const selectionObjects = (activeObject as any).getObjects
                ? (activeObject as any).getObjects()
                : [activeObject];
            const indices = selectionObjects.map((obj: any) => objects.indexOf(obj));
            const highestIndex = Math.max(...indices);

            if (highestIndex < maxIndex) {
                canvas.bringObjectForward(activeObject);
                canvas.requestRenderAll();
                onModified?.();
            }
        } else {
            const index = objects.indexOf(activeObject);
            if (index < maxIndex) {
                canvas.bringObjectForward(activeObject);
                canvas.requestRenderAll();
                onModified?.();
            }
        }
    };

    const handleSendBackward = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas || !activeObject) return;

        const objects = canvas.getObjects();
        const bgIndex = objects.findIndex(
            (obj) => (obj as any).customId === "background-rect",
        );
        const minIndex = bgIndex >= 0 ? bgIndex + 1 : 0;

        if (activeObject.type === "activeSelection") {
            const selectionObjects = (activeObject as any).getObjects
                ? (activeObject as any).getObjects()
                : [activeObject];
            const indices = selectionObjects.map((obj: any) => objects.indexOf(obj));
            const lowestIndex = Math.min(...indices);

            if (lowestIndex > minIndex) {
                canvas.sendObjectBackwards(activeObject);
                canvas.requestRenderAll();
                onModified?.();
            }
        } else {
            const index = objects.indexOf(activeObject);
            if (index > minIndex) {
                canvas.sendObjectBackwards(activeObject);
                canvas.requestRenderAll();
                onModified?.();
            }
        }
    };
    if (!position.visible || !activeObject) return null;

    return (
        <div
            ref={menuRef}
            className="absolute z-50 flex items-center gap-1 p-1.5 bg-background shadow-xl border border-border/20 rounded-full animate-in fade-in zoom-in-95 duration-200"
            style={{
                top: position.top,
                left: position.left,
                transform: `translate(-50%, -100%)`, // Centered horizontally, above vertically
            }}
            onPointerDown={(e) => e.stopPropagation()} // Prevent canvas click-through
        >
            {/* Duplicate */}
            <button
                onClick={handleDuplicate}
                className="p-2 hover:bg-muted text-foreground rounded-full transition-colors"
                title="Duplicate"
            >
                <Copy className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-border/20 mx-1" />

            {/* Layers */}
            <button
                onClick={handleBringForward}
                className="p-2 hover:bg-muted text-foreground rounded-full transition-colors"
                title="Bring Forward"
            >
                <ArrowUp className="w-4 h-4" />
            </button>
            <button
                onClick={handleSendBackward}
                className="p-2 hover:bg-muted text-foreground rounded-full transition-colors"
                title="Send Backward"
            >
                <ArrowDown className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-border/20 mx-1" />

            {/* Delete */}
            <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
                title="Delete"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
