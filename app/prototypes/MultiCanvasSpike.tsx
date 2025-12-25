"use client";

import React, { useState, useRef, useEffect } from "react";
import { Canvas, Rect } from "fabric";

/**
 * SPIKE: Refined Multiple Canvas Instances
 * 
 * Logic: One Fabric instance per page. Global zoom via CSS transform.
 * Centralized registry for canvas instances.
 */

// 1. Tiny Registry Hook (Simulation)
const useCanvasRegistry = () => {
    const registry = useRef<Map<string, Canvas>>(new Map());
    const register = (id: string, canvas: Canvas) => registry.current.set(id, canvas);
    const unregister = (id: string) => registry.current.delete(id);
    const get = (id: string) => registry.current.get(id);
    return { register, unregister, get };
};

export default function MultiCanvasSpike() {
    const [zoom, setZoom] = useState(1);
    const { register, unregister } = useCanvasRegistry();
    const [pages] = useState(["page-1", "page-2"]);

    return (
        <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center">
            <h1 className="text-white mb-4">Prototype: Refined Multi-Canvas</h1>
            
            {/* Zoom Controls */}
            <div className="flex gap-4 mb-8 bg-black/50 p-4 rounded-xl">
                <button onClick={() => setZoom(z => z + 0.1)} className="text-white px-4 py-2 border rounded hover:bg-white/10">Zoom In</button>
                <button onClick={() => setZoom(z => z - 0.1)} className="text-white px-4 py-2 border rounded hover:bg-white/10">Zoom Out</button>
                <span className="text-white flex items-center">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Workspace Wrapper (Handles Pan/Scroll) */}
            <div className="w-full max-w-4xl h-[600px] overflow-auto border border-white/10 bg-black/20 rounded-2xl relative">
                
                {/* Scaled Page Container (Handles Zoom) */}
                <div 
                    style={{ 
                        transform: `scale(${zoom})`,
                        transformOrigin: "top center",
                        transition: "transform 0.1s ease-out",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "40px",
                        padding: "100px 0"
                    }}
                >
                    {pages.map(id => (
                        <PageInstance key={id} id={id} onReady={register} onDestroy={unregister} />
                    ))}
                </div>
            </div>

            <div className="mt-8 text-gray-400 text-sm max-w-xl">
                <p>Findings:</p>
                <ul className="list-disc ml-5">
                    <li>Pros: High performance zooming via CSS. No canvas resizing.</li>
                    <li>Pros: Simple per-page logic.</li>
                    <li>Cons: Need to handle event bubbling for global interactions.</li>
                </ul>
            </div>
        </div>
    );
}

function PageInstance({ id, onReady, onDestroy }: { id: string, onReady: any, onDestroy: any }) {
    const elRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (!elRef.current) return;
        
        const canvas = new Canvas(elRef.current, {
            width: 500,
            height: 700,
            backgroundColor: "white"
        });

        canvas.add(new Rect({
            left: 50, top: 50, width: 100, height: 100, fill: "blue"
        }));

        onReady(id, canvas);

        return () => {
            canvas.dispose();
            onDestroy(id);
        };
    }, []);

    return (
        <div className="shadow-2xl bg-white">
            <canvas ref={elRef} />
        </div>
    );
}
