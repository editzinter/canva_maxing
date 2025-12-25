"use client";

import React, { useEffect, useRef } from "react";
import { Canvas, Rect, Textbox, Shadow } from "fabric";

/**
 * SPIKE: Virtual Pages (Single Canvas)
 * 
 * Logic: One large canvas. Pages are represented as Rects that act as containers/backgrounds.
 * Objects are positioned relative to the global canvas coordinate system.
 */
export default function VirtualPagesSpike() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const PAGE_WIDTH = 500;
    const PAGE_HEIGHT = 700;
    const PAGE_GAP = 50;

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize one large canvas
        const canvas = new Canvas(canvasRef.current, {
            width: 800,
            height: 2000,
            backgroundColor: "#333",
        });

        // Create Virtual Pages
        for (let i = 0; i < 3; i++) {
            const top = i * (PAGE_HEIGHT + PAGE_GAP) + PAGE_GAP;
            const left = (800 - PAGE_WIDTH) / 2;

            const pageBackground = new Rect({
                left,
                top,
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                fill: "white",
                selectable: false,
                evented: false,
                shadow: new Shadow({
                    color: "rgba(0,0,0,0.3)",
                    blur: 10,
                    offsetX: 0,
                    offsetY: 5
                })
            });

            const pageLabel = new Textbox(`Page ${i + 1}`, {
                left: left,
                top: top - 25,
                fontSize: 14,
                fill: "#ccc"
            });

            canvas.add(pageBackground, pageLabel);
        }

        // Add a test object that can be dragged between pages
        const box = new Rect({
            left: 200,
            top: 100,
            width: 100,
            height: 100,
            fill: "red"
        });
        canvas.add(box);

        return () => {
            canvas.dispose();
        };
    }, []);

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <h1 className="text-white mb-4">Prototype: Virtual Pages (Single Canvas)</h1>
            <div className="border border-gray-700 inline-block">
                <canvas ref={canvasRef} />
            </div>
            <div className="mt-4 text-gray-400 text-sm max-w-xl">
                <p>Findings:</p>
                <ul className="list-disc ml-5">
                    <li>Pros: Dragging between pages is native to Fabric.</li>
                    <li>Cons: The canvas must be huge (Performance risk).</li>
                    <li>Cons: Complex math needed to determine which "page" an object belongs to for export.</li>
                    <li>Cons: Difficult to handle page-specific backgrounds (e.g. images) without grouping.</li>
                </ul>
            </div>
        </div>
    );
}
