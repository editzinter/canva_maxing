"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, FabricObject, ActiveSelection, Rect, Point, Shadow, util } from "fabric";
import { FabricSelectionMenu } from "./FabricSelectionMenu";
import { initSmartGuides } from "./FabricSmartGuides";
import { useCanvas } from "../context/CanvasContext";

// Dimensions
export const PAGE_WIDTH = 595;
export const PAGE_HEIGHT = 842;
export const PAGE_GAP = 60; // Gap between pages

// Legacy aliases for compatibility with renderers
export const CANVAS_WIDTH = PAGE_WIDTH;
export const CANVAS_HEIGHT = PAGE_HEIGHT;

export interface InfiniteCanvasProps {
    pages: { id: string; backgroundColor?: string }[];
    activePageId: string | null;
    onPageClick: (id: string) => void;
    onSelectionChange?: (selected: FabricObject | null) => void;
    onModified?: () => void;
    onReady?: () => void;
    layoutMode?: "vertical" | "horizontal"; // New Prop
}

export function FabricCanvas({
    pages,
    activePageId,
    onPageClick,
    onSelectionChange,
    onModified,
    onReady,
    layoutMode = "vertical"
}: InfiniteCanvasProps) {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [activeObject, setActiveObject] = useState<FabricObject | null>(null);
    const { registerCanvas, unregisterCanvas, getCanvas } = useCanvas();
    const [zoom, setZoom] = useState(1);

    const pagesRef = useRef(pages);
    const layoutModeRef = useRef(layoutMode);

    useEffect(() => {
        pagesRef.current = pages;
    }, [pages]);

    useEffect(() => {
        layoutModeRef.current = layoutMode;
        // Trigger re-render to update positions
        const canvas = getCanvas("main-canvas");
        if (canvas) {
            // We need to trigger the positioning effect.
            // Since layoutMode is a dep of the effect below, it should run automatically.
        }
    }, [layoutMode, getCanvas]);

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasElRef.current || !wrapperRef.current) return;

        const containerWidth = wrapperRef.current.clientWidth;
        const containerHeight = wrapperRef.current.clientHeight;

        console.log(`[InfiniteCanvas] Initializing... Mode: ${layoutMode}`);

        const canvas = new Canvas(canvasElRef.current, {
            width: containerWidth,
            height: containerHeight,
            selection: true,
            preserveObjectStacking: true,
            stopContextMenu: true,
            fireRightClick: true,
            selectionColor: "rgba(163, 230, 53, 0.1)",
            selectionBorderColor: "#a3e635",
            selectionLineWidth: 1,
        });

        registerCanvas("main-canvas", canvas);

        // Brand Configuration
        const BRAND_COLOR = "#a3e635";
        const ANCHOR_FILL = "#ffffff";
        const ANCHOR_STROKE = "#cccccc";

        const setDefaults = (proto: any) => {
            if (!proto) return;
            proto.borderColor = BRAND_COLOR;
            proto.borderScaleFactor = 2;
            proto.cornerColor = ANCHOR_FILL;
            proto.cornerStrokeColor = ANCHOR_STROKE;
            proto.cornerStyle = "circle";
            proto.transparentCorners = false;
            proto.cornerSize = 10;
            proto.padding = 8;
            proto.hasRotatingPoint = false;
        };

        setDefaults(FabricObject.prototype);
        setDefaults(ActiveSelection.prototype);

        setTimeout(() => {
            onReady?.();
        }, 0);

        // --- CENTERING LOGIC ---
        const enforceCenter = () => {
            const w = canvas.width;
            const h = canvas.height;
            const z = canvas.getZoom();
            const vpt = canvas.viewportTransform;
            if (!vpt) return;

            // In horizontal mode, we center vertically
            // In vertical mode, we center horizontally
            if (layoutModeRef.current === 'horizontal') {
                const contentH = PAGE_HEIGHT * z;
                if (contentH < h) {
                    vpt[5] = (h - contentH) / 2;
                }
            } else {
                const contentW = PAGE_WIDTH * z;
                if (contentW < w) {
                    vpt[4] = (w - contentW) / 2;
                }
            }
            canvas.setViewportTransform(vpt);
        };

        // --- EVENT HANDLERS ---

        // Wheel Zoom & Pan
        canvas.on("mouse:wheel", (opt) => {
            const evt = opt.e;
            if (evt.ctrlKey) {
                // ZOOM
                evt.preventDefault();
                evt.stopPropagation();
                let delta = evt.deltaY;
                let zoom = canvas.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;

                canvas.zoomToPoint(new Point(evt.offsetX, evt.offsetY), zoom);
                enforceCenter();
                setZoom(zoom);
            } else {
                // PAN
                evt.preventDefault();
                evt.stopPropagation();

                let deltaX = -evt.deltaX;
                let deltaY = -evt.deltaY;

                // Lock axis if content is smaller than viewport
                if (layoutModeRef.current === 'horizontal') {
                    // Horizontal mode: Vertical pan locked if fits
                    if ((PAGE_HEIGHT * canvas.getZoom()) <= canvas.height) deltaY = 0;
                } else {
                    if ((PAGE_WIDTH * canvas.getZoom()) <= canvas.width) deltaX = 0;
                }

                canvas.relativePan(new Point(deltaX, deltaY));
                enforceCenter();
            }
        });

        // Touch & Swipe Logic
        let isPanning = false;
        let lastX = 0;
        let lastY = 0;
        let touchStartX = 0;
        let isTouching = false;

        canvas.on("mouse:down", (opt) => {
            const e = opt.e as unknown as MouseEvent;

            // Desktop Alt-Drag or Touch Pan
            // We enable pan if: Alt Key OR (Touch Event AND Zoom > 1)
            // If Touch AND Zoom <= 1 (Mobile Carousel Mode), we handle custom swipe

            const isTouch = opt.e.type === "touchstart";
            const currentZoom = canvas.getZoom();

            if (e.altKey || (isTouch && currentZoom > 1.1 && !opt.target)) {
                isPanning = true;
                lastX = e.clientX || (opt.e as any).touches?.[0].clientX;
                lastY = e.clientY || (opt.e as any).touches?.[0].clientY;
                canvas.setCursor("grabbing");
            } else if (isTouch && currentZoom <= 1.1 && layoutModeRef.current === 'horizontal' && !opt.target) {
                // Carousel Swipe Start - ONLY IF NO TARGET (Background)
                isTouching = true;
                touchStartX = (opt.e as any).touches?.[0].clientX;
                lastX = touchStartX;
                // No isPanning, we manually move vpt
            } else {
                // Click detection
                if (!opt.target) {
                    const pointer = canvas.getScenePoint(opt.e);
                    const pages = pagesRef.current;
                    let clickedPageId = null;

                    if (layoutModeRef.current === 'horizontal') {
                        const x = pointer.x;
                        pages.forEach((p, i) => {
                            const start = i * (PAGE_WIDTH + PAGE_GAP);
                            if (x >= start && x <= start + PAGE_WIDTH) clickedPageId = p.id;
                        });
                    } else {
                        const y = pointer.y;
                        pages.forEach((p, i) => {
                            const start = i * (PAGE_HEIGHT + PAGE_GAP);
                            if (y >= start && y <= start + PAGE_HEIGHT) clickedPageId = p.id;
                        });
                    }
                    if (clickedPageId) onPageClick(clickedPageId);
                }
            }
        });

        canvas.on("mouse:move", (opt) => {
            const e = opt.e as unknown as MouseEvent;
            const clientX = e.clientX || (opt.e as any).touches?.[0]?.clientX;
            const clientY = e.clientY || (opt.e as any).touches?.[0]?.clientY;

            if (isPanning && clientX !== undefined) {
                let deltaX = clientX - lastX;
                let deltaY = clientY - lastY;

                // Axis locking same as wheel
                if (layoutModeRef.current === 'horizontal') {
                    if ((PAGE_HEIGHT * canvas.getZoom()) <= canvas.height) deltaY = 0;
                } else {
                    if ((PAGE_WIDTH * canvas.getZoom()) <= canvas.width) deltaX = 0;
                }

                canvas.relativePan(new Point(deltaX, deltaY));
                lastX = clientX;
                lastY = clientY;
            } else if (isTouching && clientX !== undefined && layoutModeRef.current === 'horizontal') {
                // Swipe Logic (emulate pan but strictly horizontal)
                let deltaX = clientX - lastX;
                canvas.relativePan(new Point(deltaX, 0));
                lastX = clientX;
            }
        });

        canvas.on("mouse:up", () => {
            if (isPanning) {
                isPanning = false;
                canvas.setCursor("default");
            }
            if (isTouching) {
                isTouching = false;
                // --- SNAP LOGIC ---
                // Find nearest page and snap to it
                if (layoutModeRef.current === 'horizontal') {
                    const vpt = canvas.viewportTransform!;
                    // Current viewport center in scene coordinates
                    // SceneX = (ScreenX - vpt[4]) / scale
                    const centerX = (canvas.width / 2 - vpt[4]) / vpt[0];

                    let closestPageIndex = 0;
                    let minD = Infinity;

                    pagesRef.current.forEach((_, i) => {
                        const pageCenter = (i * (PAGE_WIDTH + PAGE_GAP)) + (PAGE_WIDTH / 2);
                        const dist = Math.abs(centerX - pageCenter);
                        if (dist < minD) {
                            minD = dist;
                            closestPageIndex = i;
                        }
                    });

                    // Animate to this page
                    const targetPageLeft = closestPageIndex * (PAGE_WIDTH + PAGE_GAP);
                    // We want targetPageCenter to be at canvas.width/2
                    // targetPageCenter = targetPageLeft + Width/2
                    // vpt[4] = width/2 - (targetPageCenter * scale)
                    const targetPageCenter = targetPageLeft + (PAGE_WIDTH / 2);
                    const newPanX = (canvas.width / 2) - (targetPageCenter * vpt[0]);

                    util.animate({
                        startValue: vpt[4],
                        endValue: newPanX,
                        duration: 300,
                        easing: util.ease.easeOutQuad,
                        onChange: (val) => {
                            vpt[4] = val;
                            canvas.requestRenderAll();
                        },
                        onComplete: () => {
                            const pid = pagesRef.current[closestPageIndex]?.id;
                            if (pid) onPageClick(pid);
                            canvas.setViewportTransform(vpt); // commit
                        }
                    });
                }
            }
        });

        // Branding & Clipping
        const enforceBranding = (obj: FabricObject) => {
            if (!obj || (obj as any).isPageBackground) return;
            obj.set({
                borderColor: BRAND_COLOR,
                cornerColor: ANCHOR_FILL,
                cornerStrokeColor: ANCHOR_STROKE,
                cornerStyle: "circle",
                transparentCorners: false,
                cornerSize: 10 / canvas.getZoom(),
                borderScaleFactor: 2 / canvas.getZoom(),
                padding: 8,
            });
        };

        const enforceClipping = (obj: FabricObject) => {
            if (!obj || (obj as any).isPageBackground || obj.type === 'activeSelection') return;

            // Preserve Custom Design Clips (e.g. Circular Images)
            // If the object has a clipPath that is NOT our auto-generated page clip, we must respect it.
            if (obj.clipPath && !(obj.clipPath as any).isPageClip) {
                return;
            }

            const pageId = (obj as any).pageId;
            if (!pageId) return;

            const pageIndex = pagesRef.current.findIndex(p => p.id === pageId);
            if (pageIndex === -1) return;

            // Calculate clip rect based on layout mode
            let left = 0, top = 0;
            if (layoutModeRef.current === 'horizontal') {
                left = pageIndex * (PAGE_WIDTH + PAGE_GAP);
                top = 0;
            } else {
                left = 0;
                top = pageIndex * (PAGE_HEIGHT + PAGE_GAP);
            }

            const clipRect = new Rect({
                left,
                top,
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                absolutePositioned: true,
            });

            // Tag it so we know it's ours
            (clipRect as any).isPageClip = true;

            obj.clipPath = clipRect;
        };

        const checkPageAssignment = (obj: FabricObject) => {
            if (!obj || (obj as any).isPageBackground || obj.type === 'activeSelection') return;
            const currentPages = pagesRef.current;
            const currentPageId = (obj as any).pageId;
            const objRect = obj.getBoundingRect();
            const center = obj.getCenterPoint();
            const isHorizontal = layoutModeRef.current === 'horizontal';

            // 1. Check if sticky
            const pageIndex = currentPages.findIndex(p => p.id === currentPageId);
            if (pageIndex !== -1) {
                let pageStart, pageEnd, objStart, objEnd;
                if (isHorizontal) {
                    pageStart = pageIndex * (PAGE_WIDTH + PAGE_GAP);
                    pageEnd = pageStart + PAGE_WIDTH;
                    objStart = objRect.left;
                    objEnd = objRect.left + objRect.width;
                } else {
                    pageStart = pageIndex * (PAGE_HEIGHT + PAGE_GAP);
                    pageEnd = pageStart + PAGE_HEIGHT;
                    objStart = objRect.top;
                    objEnd = objRect.top + objRect.height;
                }
                if ((objStart < pageEnd) && (objEnd > pageStart)) return; // Sticky
            }

            // 2. Find new page
            let bestPageId = currentPageId;
            let minDistance = Infinity;

            currentPages.forEach((page, index) => {
                let pageCenter;
                let objCenterVal;

                if (isHorizontal) {
                    const start = index * (PAGE_WIDTH + PAGE_GAP);
                    pageCenter = start + (PAGE_WIDTH / 2);
                    objCenterVal = center.x;
                } else {
                    const start = index * (PAGE_HEIGHT + PAGE_GAP);
                    pageCenter = start + (PAGE_HEIGHT / 2);
                    objCenterVal = center.y;
                }

                const dist = Math.abs(objCenterVal - pageCenter);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestPageId = page.id;
                }
            });

            if (bestPageId && bestPageId !== currentPageId) {
                (obj as any).pageId = bestPageId;
                enforceClipping(obj);
                onPageClick(bestPageId);
            }
        };

        canvas.on("object:moving", (e) => checkPageAssignment(e.target));

        canvas.on("selection:created", (e) => {
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                enforceBranding(activeObj);
                if ((activeObj as any).pageId) onPageClick((activeObj as any).pageId);
            }
            setActiveObject(activeObj || null);
            onSelectionChange?.(activeObj || null);
        });

        canvas.on("selection:updated", (e) => {
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                enforceBranding(activeObj);
                if ((activeObj as any).pageId) onPageClick((activeObj as any).pageId);
            }
            setActiveObject(activeObj || null);
            onSelectionChange?.(activeObj || null);
        });

        canvas.on("selection:cleared", () => {
            setActiveObject(null);
            onSelectionChange?.(null);
        });

        canvas.on("object:modified", () => onModified?.());

        canvas.on("object:added", (e) => {
            if (e.target) {
                enforceBranding(e.target);
                enforceClipping(e.target);
            }
            onModified?.();
        });

        canvas.on("object:removed", () => onModified?.());

        // Resize & Center
        const resizeObserver = new ResizeObserver(() => {
            if (!wrapperRef.current) return;
            const newWidth = wrapperRef.current.clientWidth;
            const newHeight = wrapperRef.current.clientHeight;

            canvas.setDimensions({ width: newWidth, height: newHeight });

            // Auto-Fit Zoom for Mobile (Horizontal Mode)
            if (layoutModeRef.current === 'horizontal' && newWidth < PAGE_WIDTH * 1.5) {
                // Fit page width with some padding
                const fitZoom = (newWidth - 40) / PAGE_WIDTH;
                const centerPoint = new Point(newWidth / 2, newHeight / 2);
                canvas.zoomToPoint(centerPoint, fitZoom);
                setZoom(fitZoom);

                // Ensure first page is centered initially
                const vpt = canvas.viewportTransform!;
                vpt[4] = (newWidth - (PAGE_WIDTH * fitZoom)) / 2;
                canvas.setViewportTransform(vpt);
            } else {
                enforceCenter();
            }

            canvas.requestRenderAll();
        });
        resizeObserver.observe(wrapperRef.current);

        const cleanupGuides = initSmartGuides(canvas);

        return () => {
            cleanupGuides();
            resizeObserver.disconnect();
            canvas.dispose();
            unregisterCanvas("main-canvas");
        };
    }, []); // Init only once. Mode changes handled via Refs/Effects.

    // Handle Mode Changes (Re-render objects if needed? No, standard logic handles position)
    // Actually, if we switch mode, the objects are at old positions (Vertical). 
    // WE NEED TO MOVE THEM physically.

    useEffect(() => {
        const canvas = getCanvas("main-canvas");
        if (!canvas) return;

        const isHorizontal = layoutMode === 'horizontal';
        console.log("Switching Layout Mode to:", layoutMode);

        const existingBackgrounds = canvas.getObjects().filter((o: any) => o.isPageBackground);

        // Relocate Pages & Objects
        // Implementation Note: This is expensive. We iterate all objects.
        const allObjects = canvas.getObjects();

        pages.forEach((page, index) => {
            const oldPos = { left: 0, top: 0 }; // We'd need to know previous mode, but let's just calc target

            let targetLeft = 0;
            let targetTop = 0;

            if (isHorizontal) {
                targetLeft = index * (PAGE_WIDTH + PAGE_GAP);
                targetTop = 0;
            } else {
                targetLeft = 0;
                targetTop = index * (PAGE_HEIGHT + PAGE_GAP);
            }

            // Move Background
            const bg = existingBackgrounds.find((o: any) => o.pageId === page.id);
            if (bg) {
                // Calculate Delta
                const deltaX = targetLeft - bg.left;
                const deltaY = targetTop - bg.top;

                if (deltaX !== 0 || deltaY !== 0) {
                    bg.set({ left: targetLeft, top: targetTop });
                    bg.setCoords();

                    // Move all objects belonging to this page
                    allObjects.forEach((obj: any) => {
                        if (obj.pageId === page.id && !obj.isPageBackground) {
                            obj.set({
                                left: obj.left + deltaX,
                                top: obj.top + deltaY
                            });
                            obj.setCoords();
                            // Update clip path
                            if (obj.clipPath) {
                                obj.clipPath = new Rect({
                                    left: targetLeft,
                                    top: targetTop,
                                    width: PAGE_WIDTH,
                                    height: PAGE_HEIGHT,
                                    absolutePositioned: true
                                });
                            }
                        }
                    });
                }
            }
        });

        canvas.requestRenderAll();

        // Also update Background rendering logic (create new BGs if missing)
        // Reuse the logic from the other effect or just let it run?
        // The other effect runs on [pages, activePageId]. 
        // It uses calculated `pageY` assuming Vertical. 
        // We need to fix THAT effect too.

    }, [layoutMode, pages, getCanvas]); // Run when mode flips


    // Page Rendering Effect (Fixed for Layout Mode)
    useEffect(() => {
        const canvas = getCanvas("main-canvas");
        if (!canvas) return;

        const existingBackgrounds = canvas.getObjects().filter((o: any) => o.isPageBackground);
        const isHorizontal = layoutMode === 'horizontal';

        pages.forEach((page, index) => {
            let left = 0, top = 0;
            if (isHorizontal) {
                left = index * (PAGE_WIDTH + PAGE_GAP);
            } else {
                top = index * (PAGE_HEIGHT + PAGE_GAP);
            }

            // 1. Background (Bottom)
            let bgRect = existingBackgrounds.find((o: any) => o.pageId === page.id && o.isPageBackground);
            if (!bgRect) {
                bgRect = new Rect({
                    left, top,
                    width: PAGE_WIDTH, height: PAGE_HEIGHT,
                    fill: page.backgroundColor || "#ffffff",
                    selectable: false, evented: false,
                    shadow: new Shadow({ color: 'rgba(0,0,0,0.3)', blur: 20, offsetX: 0, offsetY: 10 })
                });
                (bgRect as any).isPageBackground = true;
                (bgRect as any).pageId = page.id;
                canvas.add(bgRect);
                canvas.sendObjectToBack(bgRect);
            } else {
                if (bgRect.left !== left || bgRect.top !== top) {
                    bgRect.set({ left, top });
                    bgRect.setCoords();
                }
                if (bgRect.fill !== page.backgroundColor) bgRect.set({ fill: page.backgroundColor || "#ffffff" });
            }

            // 2. Highlight Frame (Top) - NEW
            let frameRect = existingBackgrounds.find((o: any) => o.pageId === page.id && o.isPageFrame);
            const isActive = page.id === activePageId;

            if (!frameRect) {
                frameRect = new Rect({
                    left, top,
                    width: PAGE_WIDTH, height: PAGE_HEIGHT,
                    fill: "transparent",
                    stroke: "#a3e635",
                    strokeWidth: 4, // Thicker
                    selectable: false, evented: false,
                    opacity: isActive ? 1 : 0
                });
                (frameRect as any).isPageBackground = true; // Keep logic simple for cleanup
                (frameRect as any).isPageFrame = true;     // Distinguish
                (frameRect as any).pageId = page.id;
                canvas.add(frameRect);
            }

            // Update Frame
            if (frameRect) {
                frameRect.set({
                    left, top,
                    opacity: isActive ? 1 : 0,
                    stroke: "#a3e635"
                });
                canvas.bringObjectToFront(frameRect); // Ensure visibility
            }
        });

        // Remove stale
        existingBackgrounds.forEach((bg: any) => {
            if (!pages.find(p => p.id === bg.pageId)) canvas.remove(bg);
        });

        canvas.requestRenderAll();
    }, [pages, activePageId, layoutMode, getCanvas]);

    return (
        <div
            ref={wrapperRef}
            className="absolute inset-0 overflow-hidden bg-muted/30"
        >
            <canvas ref={canvasElRef} />
            <FabricSelectionMenu
                canvas={getCanvas("main-canvas") || null}
                activeObject={activeObject}
                zoom={zoom}
                onModified={onModified}
            />
        </div>
    );
}
