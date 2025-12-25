"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Canvas, FabricObject, Textbox, FabricImage, Rect, Gradient, util, loadSVGFromURL } from "fabric";
import { ChevronLeft, ZoomIn, ZoomOut, RotateCcw, Plus, Trash2, Copy, GripVertical, Save } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

import { FabricCanvas, PAGE_HEIGHT, PAGE_GAP, PAGE_WIDTH } from "../components/FabricCanvas";
import { EditorSidebar } from "../components/EditorSidebar";
import { ToolPanel } from "../components/ToolPanel";
import { ExportButton } from "../components/ExportButton";
import { UnsavedChangesModal } from "../components/UnsavedChangesModal";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useCanvas } from "../context/CanvasContext";
import { useMediaQuery } from "@/app/hooks/use-media-query";

import { getTemplate, DEFAULT_TEMPLATE_ID } from "@/app/templates/manifest";
import { canvasToTemplateJSON } from "../utils/canvasToTemplate";

type PageData = {
    id: string;
    layoutId: string;
    rendered: boolean;
    backgroundColor?: string;
};

// Font family mapping - CSS class to Fabric fontFamily
const FONT_MAP: Record<string, string> = {
    // Sans-Serif
    "font-manrope": "Manrope",
    "font-inter": "Inter",
    "font-poppins": "Poppins",
    "font-montserrat": "Montserrat",
    "font-dm-sans": "DM Sans",
    "font-outfit": "Outfit",
    "font-work-sans": "Work Sans",
    "font-source": "Source Sans 3",
    "font-nunito": "Nunito",
    // Serif
    "font-playfair": "Playfair Display",
    "font-cormorant": "Cormorant Garamond",
    "font-dm-serif": "DM Serif Display",
    "font-abril": "Abril Fatface",
    "font-lora": "Lora",
    "font-merriweather": "Merriweather",
    // Display
    "font-syne": "Syne",
    "font-italiana": "Italiana",
    "font-julius": "Julius Sans One",
    "font-marcellus": "Marcellus",
    "font-forum": "Forum",
    "font-bebas": "Bebas Neue",
    "font-oswald": "Oswald",
    "font-lobster": "Lobster",
    "font-permanent-marker": "Permanent Marker",
    // Script
    "font-pinyon": "Pinyon Script",
    "font-alex": "Alex Brush",
    "font-mrs-saint": "Mrs Saint Delafield",
    "font-great-vibes": "Great Vibes",
    "font-dancing-script": "Dancing Script",
    "font-pacifico": "Pacifico",
};

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Threshold for using file storage (500KB)
const STORAGE_THRESHOLD = 500 * 1024;

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = (params.id as string) || DEFAULT_TEMPLATE_ID;

    // 1. Try to fetch as a PROJECT ID (Persistence)
    // We optimistically try to fetch. If it returns null, we fallback to Template ID.
    const project = useQuery(api.projects.getById, { id });

    // 2. Try to fetch as a TEMPLATE ID (Legacy/Mock)
    const templateManifest = getTemplate(id);

    // Determines real source of truth
    const [renderSource, setRenderSource] = useState<{ type: 'project' | 'template', data: any } | null>(null);

    // Initial Load Logic
    useEffect(() => {
        const prepareSource = async () => {
            if (project !== undefined) {
                // Project query finished (either found or null)
                if (project) {
                    // It's a valid saved project!
                    let finalProjectData = { ...project };

                    // If content is in storage, fetch it
                    if (project.storageUrl && !project.content) {
                        try {
                            const res = await fetch(project.storageUrl);
                            if (res.ok) {
                                const content = await res.text();
                                finalProjectData.content = content;
                            } else {
                                console.error("Failed to fetch project content from storage");
                            }
                        } catch (err) {
                            console.error("Error fetching storage content:", err);
                        }
                    }

                    setRenderSource({ type: 'project', data: finalProjectData });
                } else if (templateManifest) {
                    // Not a project, but valid template slug
                    setRenderSource({ type: 'template', data: templateManifest });
                }
            }
        };

        prepareSource();
    }, [project, templateManifest]);

    // Device State
    const isMobile = useMediaQuery("(max-width: 768px)");

    // State
    const [activeTool, setActiveTool] = useState("layout");
    const [pages, setPages] = useState<PageData[]>([]);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [backgroundColor, setBackgroundColor] = useState("#0a0a0a");
    const [activeTexture, setActiveTexture] = useState<"none" | "grain" | "paper">("none");
    const [activeLayout, setActiveLayout] = useState("classic");

    // Save & Dirty State
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const lastSavedContentRef = useRef<string | null>(null);
    const pendingNavigationRef = useRef<string | null>(null);
    const updateProject = useMutation(api.projects.update);

    const { getCanvas, setActiveCanvasId } = useCanvas();
    const renderedPagesRef = useRef<Set<string>>(new Set());

    // Refs for Proxy Logic to access latest state without re-binding
    const layoutModeRef = useRef<"vertical" | "horizontal">("vertical");
    const isRenderingRef = useRef(false);
    useEffect(() => {
        layoutModeRef.current = isMobile ? "horizontal" : "vertical";
    }, [isMobile]);

    // Helper: Serialize current canvas state to structured JSON string
    const getCurrentCanvasContent = useCallback(() => {
        const mainCanvas = getCanvas("main-canvas");
        if (!mainCanvas) return null;
        if (!renderSource || renderSource.type !== 'project') return null;

        const projectData = renderSource.data as any;
        const templateJSON = canvasToTemplateJSON(
            mainCanvas,
            projectData.name,
            projectData._id,
            pages,
            layoutModeRef.current // Pass current layout mode
        );
        return JSON.stringify(templateJSON);
    }, [getCanvas, renderSource, pages]);

    // Convex Mutations
    const generateUploadUrl = useMutation(api.projects.generateUploadUrl);

    // Save handler
    const handleSave = useCallback(async () => {
        if (renderSource?.type !== 'project') {
            console.warn("Cannot save: not a project");
            return;
        }
        const content = getCurrentCanvasContent();
        if (!content) {
            console.warn("Cannot save: no canvas content");
            return;
        }

        setIsSaving(true);
        try {
            // Check size determines storage strategy
            const size = new Blob([content]).size;

            if (size > STORAGE_THRESHOLD) {
                console.log(`Saving to Storage (Size: ${size} bytes)...`);

                // 1. Get Upload URL
                const postUrl = await generateUploadUrl();

                // 2. Upload File
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: content,
                });

                if (!result.ok) throw new Error("Upload failed");
                const { storageId } = await result.json();

                // 3. Update Project with storageId
                await updateProject({
                    id: renderSource.data._id as Id<"projects">,
                    storageId: storageId,
                    content: undefined, // Clear legacy content
                });

            } else {
                console.log(`Saving to Document (Size: ${size} bytes)...`);
                // Standard Save
                await updateProject({
                    id: renderSource.data._id as Id<"projects">,
                    content: content,
                    storageId: undefined, // Clear storageId if downsizing
                });
            }

            // Update local ref to match what we just saved (the raw content)
            lastSavedContentRef.current = content;
            setIsDirty(false);
            console.log("Project saved successfully");

            // Re-fetch project to get new storageUrl if applicable? 
            // The project query will auto-update, triggering the effect.
            // But we already have the content in memory, so renderSource might flicker?
            // Actually, we should manually update renderSource specific fields to prevent "Loading..." flicker
            // if the effect runs again with storageUrl but no content yet fetched?
            // The template useMemo uses `renderSource.data.content`.
            // We should ideally update renderSource.data.content with `content` here to keep it fresh.
            setRenderSource(prev => prev ? ({
                ...prev,
                data: {
                    ...prev.data,
                    content: content, // Ensure content remains available in state
                }
            }) : null);


        } catch (error) {
            console.error("Failed to save project:", error);
        } finally {
            setIsSaving(false);
        }
    }, [renderSource, getCurrentCanvasContent, updateProject, generateUploadUrl]);

    // Navigation guard
    const handleNavigation = useCallback((href: string) => {
        if (isDirty) {
            pendingNavigationRef.current = href;
            setShowUnsavedModal(true);
        } else {
            router.push(href);
        }
    }, [isDirty, router]);

    // Modal actions
    const handleModalSave = useCallback(async () => {
        await handleSave();
        setShowUnsavedModal(false);
        if (pendingNavigationRef.current) {
            router.push(pendingNavigationRef.current);
            pendingNavigationRef.current = null;
        }
    }, [handleSave, router]);

    const handleModalDiscard = useCallback(() => {
        setShowUnsavedModal(false);
        setIsDirty(false);
        if (pendingNavigationRef.current) {
            router.push(pendingNavigationRef.current);
            pendingNavigationRef.current = null;
        }
    }, [router]);

    const handleModalCancel = useCallback(() => {
        setShowUnsavedModal(false);
        pendingNavigationRef.current = null;
    }, []);

    // Beforeunload warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Derived Template Config for handleCanvasReady compatibility
    // MUST be at component top level (not inside useEffect)
    const template = useMemo(() => {
        if (!renderSource) return null;
        if (renderSource.type === 'template') return renderSource.data;
        if (renderSource.type === 'project') {
            const projectData = renderSource.data;
            // If project has saved content, return a virtual template object
            if (projectData.content) {
                return {
                    name: projectData.name,
                    id: projectData._id,
                    format: "saved",
                    savedContent: projectData.content,
                };
            }
            // New project - get template from templateId
            if (projectData.templateId && projectData.templateId !== 'blank') {
                return getTemplate(projectData.templateId);
            }
            // Blank project
            return {
                name: projectData.name || "Untitled",
                id: projectData._id,
                format: "blank",
            };
        }
        return null;
    }, [renderSource]);

    // Initialize pages from Source
    useEffect(() => {
        if (!renderSource) return;

        const { type, data } = renderSource;

        const loadFromTemplate = (tmpl: any) => {
            // ... Logic to load from manifest ...
            if (tmpl.format === "json" && tmpl.jsonPath) {
                fetch(tmpl.jsonPath)
                    .then(res => res.json())
                    .then(jsonTemplate => {
                        // Detect V2 format
                        const isV2 = jsonTemplate.version === "2.0";
                        const bgColor = isV2
                            ? jsonTemplate.tokens?.colors?.background
                            : jsonTemplate.style?.background;

                        const templatePages = jsonTemplate.pages.map((page: any, index: number) => ({
                            id: page.id || `page-${index + 1}`,
                            layoutId: page.id || `page-${index + 1}`,
                            rendered: false,
                            backgroundColor: page.background || bgColor || "#ffffff"
                        }));
                        setPages(templatePages);
                        setActivePageId(templatePages[0]?.id || null);
                        setBackgroundColor(bgColor || "#0a0a0a");
                        setIsLoading(false);
                    })
                    .catch(err => {
                        console.error("Failed to load JSON template:", err);
                        setIsLoading(false);
                    });
            } else if (tmpl.pages) {
                // Legacy
                const templatePages = tmpl.pages.map((page: any, index: number) => ({
                    id: `page-${index + 1}`,
                    layoutId: page.layoutId,
                    rendered: false,
                    backgroundColor: tmpl.backgroundColor
                }));
                setPages(templatePages);
                setActivePageId(templatePages[0]?.id || null);
                setBackgroundColor(tmpl.backgroundColor || "#0a0a0a");
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };

        if (type === 'project') {
            // LOAD FROM PROJECT RECORD
            if (data.content) {
                console.log("Hydrating saved project content...");
                try {
                    const savedJson = JSON.parse(data.content);
                    const savedPages = savedJson.pages.map((page: any, index: number) => ({
                        id: page.id || `page-${index + 1}`,
                        layoutId: page.id || `page-${index + 1}`,
                        rendered: false,
                        backgroundColor: page.background || savedJson.style?.background
                    }));
                    setPages(savedPages);
                    setActivePageId(savedPages[0]?.id || null);
                    if (savedJson.style?.background) {
                        setBackgroundColor(savedJson.style.background);
                    }
                    setIsLoading(false);
                } catch (e) {
                    console.error("Failed to parse saved project:", e);
                    // Fallback to blank if parse fails
                    setPages([{ id: 'page-1', layoutId: 'custom', rendered: false, backgroundColor: '#ffffff' }]);
                    setIsLoading(false);
                }
            } else {
                // New Project - Check Template ID
                if (data.templateId === 'blank') {
                    // Initialize BLANK with dimensions
                    // We need to pass dimensions to the Canvas component? 
                    // For now, default blank setup
                    setPages([{ id: 'page-1', layoutId: 'blank', rendered: false, backgroundColor: '#ffffff' }]);
                    setIsLoading(false);
                } else {
                    // Load the base template
                    const baseTemplate = getTemplate(data.templateId);
                    if (baseTemplate) {
                        loadFromTemplate(baseTemplate);
                    }
                }
            }
        } else {
            // LOAD FROM TEMPLATE (Preview Mode)
            loadFromTemplate(data);
        }

    }, [renderSource]);

    // ------------------------------------------------------------------
    // RENDER LOGIC (THE MAGIC SAUCE)
    // ------------------------------------------------------------------
    // We render ALL pages onto the MAIN canvas, but offset them.

    const handleCanvasReady = useCallback(async () => {
        if (!template) return;
        const mainCanvas = getCanvas("main-canvas");
        if (!mainCanvas) return;

        console.log("Main Canvas Ready. Rendering pages...");

        // Check if this is a JSON template OR a saved project
        const isJsonTemplate = template.format === "json" && template.jsonPath;
        const isSavedProject = template.format === "saved" && template.savedContent;

        if (isJsonTemplate || isSavedProject) {
            // Prevent concurrent rendering
            if (isRenderingRef.current) return;
            isRenderingRef.current = true;

            // Use Universal Renderer for JSON templates
            const { renderTemplate, loadTemplate } = await import("@/app/engine");

            try {
                let jsonTemplate;
                if (isJsonTemplate) {
                    jsonTemplate = await loadTemplate(template.jsonPath!);
                } else {
                    jsonTemplate = JSON.parse(template.savedContent!);
                }

                // CRITICAL FIX: Prevent Double Rendering
                // Clear existing content objects but preserve background/frames
                const mainCanvas = getCanvas("main-canvas");
                if (mainCanvas) {
                    const existingObjects = mainCanvas.getObjects();
                    existingObjects.forEach(obj => {
                        // Check if it's a content object (not a background/frame)
                        const isBackground = (obj as any).isPageBackground;
                        const isFrame = (obj as any).isPageFrame;
                        if (!isBackground && !isFrame) {
                            mainCanvas.remove(obj);
                        }
                    });
                }

                const layoutMode = layoutModeRef.current;
                if (!mainCanvas) {
                    console.warn("Canvas not available for rendering");
                    return;
                }
                await renderTemplate(mainCanvas, jsonTemplate, layoutMode);

                // Mark all pages as rendered
                pages.forEach(p => renderedPagesRef.current.add(p.id));
            } catch (err) {
                console.error("Failed to render JSON template:", err);
            } finally {
                isRenderingRef.current = false;
            }

            mainCanvas?.requestRenderAll();
            return;
        }

        // Legacy rendering logic for non-JSON templates
        pages.forEach((page, index) => {
            if (renderedPagesRef.current.has(page.id)) return;

            // 1. Calculate Offsets based on CURRENT mode (at render time)
            // Note: Templates usually render ONCE at start.
            // If user resizes, we rely on FabricCanvas to MOVE objects.
            // We just need to spawn them correctly initially.
            // CAUTION: If we spawn in vertical mode, then switch to horizontal, FabricCanvas moves them.
            // So we can default to Vertical for initial render, or respect current.
            // Let's respect current to be safe.

            const isHorizontal = layoutModeRef.current === 'horizontal';
            const pageOffsetX = isHorizontal ? index * (PAGE_WIDTH + PAGE_GAP) : 0;
            const pageOffsetY = isHorizontal ? 0 : index * (PAGE_HEIGHT + PAGE_GAP);

            // 2. Find the renderer
            const match = page.id.match(/^page-(\d+)$/);
            let renderer = null;
            if (match && template.pages) {
                const initIndex = parseInt(match[1], 10) - 1;
                if (template.pages[initIndex]) {
                    renderer = template.pages[initIndex].renderer;
                }
            }
            if (!renderer && template.pages?.[0]) {
                renderer = template.pages[0].renderer;
            }

            if (renderer) {
                console.log(`Rendering ${page.id} at X=${pageOffsetX} Y=${pageOffsetY}`);

                // 3. Create a Proxy Canvas that intercepts .add()
                const proxyCanvas = new Proxy(mainCanvas, {
                    get(target, prop, receiver) {
                        if (prop === "add") {
                            return (...objects: FabricObject[]) => {
                                objects.forEach(obj => {
                                    // Apply offset
                                    obj.left = (obj.left || 0) + pageOffsetX;
                                    obj.top = (obj.top || 0) + pageOffsetY;
                                    // Mark ownership
                                    (obj as any).pageId = page.id;
                                    target.add(obj);
                                });
                            };
                        }
                        if (prop === "width") return PAGE_WIDTH;
                        if (prop === "height") return PAGE_HEIGHT;
                        return Reflect.get(target, prop, receiver);
                    }
                });

                try {
                    renderer(proxyCanvas as any, template.data, template.style);
                    renderedPagesRef.current.add(page.id);
                } catch (e) {
                    console.error("Renderer failed", e);
                }
            }
        });

        mainCanvas.requestRenderAll();

    }, [pages, template, getCanvas]); // Removed layoutModeRef dep to avoid re-rendering loop on resize

    // Handle selection change
    const handleSelectionChange = useCallback((obj: FabricObject | null) => {
        setSelectedObject(obj);
        if (obj && (obj as any).pageId) {
            setActivePageId((obj as any).pageId);
        }
    }, []);

    // Add new page
    const addPage = useCallback(() => {
        const newPageId = `page-${Date.now()}`;
        setPages(prev => [...prev, {
            id: newPageId,
            layoutId: "blank",
            rendered: true,
            backgroundColor: backgroundColor
        }]);
        setActivePageId(newPageId);
    }, [backgroundColor]);

    // ============== TOOL PANEL CALLBACKS ==============

    const getActivePageOffset = () => {
        const index = pages.findIndex(p => p.id === activePageId);
        if (index === -1) return { x: 0, y: 0 };

        const isHorizontal = layoutModeRef.current === 'horizontal';
        return {
            x: isHorizontal ? index * (PAGE_WIDTH + PAGE_GAP) : 0,
            y: isHorizontal ? 0 : index * (PAGE_HEIGHT + PAGE_GAP)
        };
    };

    // Add Text to active canvas
    const handleAddText = useCallback((type: "headline" | "subhead" | "body", text?: string) => {
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;

        const offset = getActivePageOffset();

        let fontSize = 16;
        let fontFamily = "Manrope";
        let fill = "#ffffff";
        let content = text || "New Text";

        if (type === "headline") {
            fontSize = 72;
            fontFamily = "Bebas Neue";
            fill = "#d9f99d";
            content = text || "New Headline";
        } else if (type === "subhead") {
            fontSize = 24;
            fontFamily = "Manrope";
            fill = "#ffffff";
            content = text || "New Subheading";
        } else {
            fontSize = 14;
            fontFamily = "Manrope";
            fill = "#d4d4d4";
            content = text || "Add your body text here";
        }

        const textbox = new Textbox(content, {
            left: 100 + offset.x,
            top: 100 + offset.y + Math.random() * 50,
            width: 400,
            fontSize,
            fontFamily,
            fill,
            textAlign: "center",
            editable: true,
            selectable: true,
        });
        (textbox as any).customId = `text-${Date.now()}`;
        (textbox as any).pageId = activePageId;

        activeCanvas.add(textbox);
        activeCanvas.setActiveObject(textbox);
        activeCanvas.requestRenderAll();
    }, [getCanvas, activePageId, pages]);

    // Update background color
    const handleUpdateBackground = useCallback((color: string) => {
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;

        setPages(prev => prev.map(p =>
            p.id === activePageId || pages.length === 1
                ? { ...p, backgroundColor: color }
                : p
        ));
        setBackgroundColor(color);
    }, [getCanvas, activePageId, pages]);

    // Add shape (Rectangle, Circle, Line, and Polygons)
    const handleAddShape = useCallback((shapeType: 'rect' | 'circle' | 'line' | 'triangle' | 'diamond' | 'hexagon' | 'pentagon' | 'octagon' | 'star', options?: { fill?: string; stroke?: string; strokeWidth?: number }) => {
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;
        const offset = getActivePageOffset();

        const defaults = {
            fill: options?.fill || '#4ade80',
            stroke: options?.stroke || 'transparent',
            strokeWidth: options?.strokeWidth || 0,
            selectable: true,
            evented: true,
        };

        let shape: FabricObject;

        // Helper to generate polygon points
        const generatePolygonPoints = (sides: number, radius: number, startAngle: number = -Math.PI / 2): { x: number; y: number }[] => {
            const points = [];
            for (let i = 0; i < sides; i++) {
                const angle = startAngle + (Math.PI * 2 / sides) * i;
                points.push({
                    x: radius + radius * Math.cos(angle),
                    y: radius + radius * Math.sin(angle),
                });
            }
            return points;
        };

        // Helper for star points
        const generateStarPoints = (points: number, outerRadius: number, innerRadius: number): { x: number; y: number }[] => {
            const result = [];
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI / points) * i - Math.PI / 2;
                result.push({
                    x: outerRadius + radius * Math.cos(angle),
                    y: outerRadius + radius * Math.sin(angle),
                });
            }
            return result;
        };

        if (shapeType === 'rect') {
            shape = new Rect({
                left: 150 + offset.x,
                top: 150 + offset.y,
                width: 150,
                height: 100,
                rx: 8,
                ry: 8,
                ...defaults,
            });
        } else if (shapeType === 'circle') {
            const { Circle: FabricCircle } = require('fabric');
            shape = new FabricCircle({
                left: 150 + offset.x,
                top: 150 + offset.y,
                radius: 60,
                ...defaults,
            });
        } else if (shapeType === 'line') {
            const { Line: FabricLine } = require('fabric');
            shape = new FabricLine([0, 0, 200, 0], {
                left: 150 + offset.x,
                top: 200 + offset.y,
                stroke: options?.stroke || '#ffffff',
                strokeWidth: options?.strokeWidth || 3,
                selectable: true,
                evented: true,
            });
        } else if (shapeType === 'triangle') {
            const { Polygon: FabricPolygon } = require('fabric');
            const size = 80;
            shape = new FabricPolygon([
                { x: size, y: 0 },
                { x: size * 2, y: size * 1.7 },
                { x: 0, y: size * 1.7 },
            ], {
                left: 150 + offset.x,
                top: 150 + offset.y,
                ...defaults,
            });
        } else if (shapeType === 'diamond') {
            const { Polygon: FabricPolygon } = require('fabric');
            const size = 60;
            shape = new FabricPolygon([
                { x: size, y: 0 },
                { x: size * 2, y: size },
                { x: size, y: size * 2 },
                { x: 0, y: size },
            ], {
                left: 150 + offset.x,
                top: 150 + offset.y,
                ...defaults,
            });
        } else if (shapeType === 'hexagon') {
            const { Polygon: FabricPolygon } = require('fabric');
            shape = new FabricPolygon(generatePolygonPoints(6, 60), {
                left: 150 + offset.x,
                top: 150 + offset.y,
                ...defaults,
            });
        } else if (shapeType === 'pentagon') {
            const { Polygon: FabricPolygon } = require('fabric');
            shape = new FabricPolygon(generatePolygonPoints(5, 60), {
                left: 150 + offset.x,
                top: 150 + offset.y,
                ...defaults,
            });
        } else if (shapeType === 'octagon') {
            const { Polygon: FabricPolygon } = require('fabric');
            shape = new FabricPolygon(generatePolygonPoints(8, 60), {
                left: 150 + offset.x,
                top: 150 + offset.y,
                ...defaults,
            });
        } else if (shapeType === 'star') {
            const { Polygon: FabricPolygon } = require('fabric');
            shape = new FabricPolygon(generateStarPoints(5, 60, 25), {
                left: 150 + offset.x,
                top: 150 + offset.y,
                ...defaults,
            });
        } else {
            return; // Unknown shape
        }

        (shape as any).customId = `shape-${Date.now()}`;
        (shape as any).pageId = activePageId;

        activeCanvas.add(shape);
        activeCanvas.setActiveObject(shape);
        activeCanvas.requestRenderAll();
    }, [getCanvas, activePageId, getActivePageOffset]);

    // Add image
    const handleAddImage = useCallback(async (src: string) => {
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;
        const offset = getActivePageOffset();

        try {
            const img = await FabricImage.fromURL(src, { crossOrigin: "anonymous" });
            const maxWidth = 200;
            const maxHeight = 200;
            const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!, 1);

            img.set({
                left: 200 + offset.x,
                top: 200 + offset.y,
                scaleX: scale,
                scaleY: scale,
                selectable: true,
            });
            (img as any).customId = `img-${Date.now()}`;
            (img as any).pageId = activePageId;

            activeCanvas.add(img);
            activeCanvas.setActiveObject(img);
            activeCanvas.requestRenderAll();
        } catch (error) {
            console.error("Failed to load image:", error);
        }
    }, [getCanvas, activePageId, pages]);

    // Update item style
    const handleUpdateItemStyle = useCallback((id: string, updates: any) => {
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;

        const obj = activeCanvas.getActiveObject();
        if (obj) {
            // Map ToolPanel 'updates' payload to Fabric properties

            // 1. Font Family (fontClass -> fontFamily)
            if (updates.fontClass) {
                const fabricFont = FONT_MAP[updates.fontClass] || updates.fontClass;
                obj.set({ fontFamily: fabricFont });
            }
            else if (updates.fontFamily) {
                // Direct fallback
                const fabricFont = FONT_MAP[updates.fontFamily] || updates.fontFamily;
                obj.set({ fontFamily: fabricFont });
            }

            // 2. Font Size (style.fontSize -> fontSize)
            // ToolPanel sends "24px" string, we need number
            if (updates.style && updates.style.fontSize) {
                const size = parseInt(updates.style.fontSize as string);
                if (!isNaN(size)) obj.set({ fontSize: size });
            }
            else if (updates.fontSize) {
                obj.set({ fontSize: updates.fontSize });
            }

            // 3. Color (style.color -> fill)
            if (updates.style && updates.style.color) {
                obj.set({ fill: updates.style.color });
            }
            else if (updates.fill !== undefined) {
                obj.set({ fill: updates.fill });
            }

            // 4. Alignment ({ alignClass: 'text-center' } -> textAlign: 'center')
            if (updates.alignClass) {
                let align = 'left';
                if (updates.alignClass === 'text-center') align = 'center';
                if (updates.alignClass === 'text-right') align = 'right';
                // Fabric uses 'justify' or 'left'/'center'/'right'
                obj.set({ textAlign: align });
            }
            else if (updates.textAlign) {
                obj.set({ textAlign: updates.textAlign });
            }

            // 5. Shape/Image stroke properties
            if (updates.stroke !== undefined) {
                obj.set({ stroke: updates.stroke });
            }
            if (updates.strokeWidth !== undefined) {
                obj.set({ strokeWidth: updates.strokeWidth });
            }

            // 6. Opacity
            if (updates.opacity !== undefined) {
                obj.set({ opacity: updates.opacity });
            }

            // 7. Corner radius (for rounded rectangles)
            if (updates.cornerRadius !== undefined && (obj.type === 'rect' || obj.type === 'image')) {
                obj.set({ rx: updates.cornerRadius, ry: updates.cornerRadius });
                (obj as any).cornerRadius = updates.cornerRadius;
            }

            // 8. Clip shape for images
            if (updates.clipShape !== undefined && obj.type === 'image') {
                (obj as any).clipShape = updates.clipShape;

                // Apply clipPath based on shape type
                // IMPORTANT: Fabric clipPath coordinates are relative to object CENTER, not top-left
                const imgWidth = obj.width!;
                const imgHeight = obj.height!;
                const minDim = Math.min(imgWidth, imgHeight);

                if (updates.clipShape === 'circle') {
                    const { Circle: FabricCircle } = require('fabric');
                    const radius = minDim / 2;
                    // Center at (0,0) = object's center point
                    const clipCircle = new FabricCircle({
                        radius: radius,
                        originX: 'center',
                        originY: 'center',
                        left: 0,
                        top: 0,
                        absolutePositioned: false,
                    });
                    obj.set({ clipPath: clipCircle });
                } else if (updates.clipShape === 'rounded') {
                    const clipRadius = (obj as any).cornerRadius || 40; // Default to 40 for visible rounded corners
                    // Full size rounded rect centered on object
                    const clipRect = new Rect({
                        width: imgWidth,
                        height: imgHeight,
                        rx: clipRadius,
                        ry: clipRadius,
                        originX: 'center',
                        originY: 'center',
                        left: 0,
                        top: 0,
                        absolutePositioned: false,
                    });
                    obj.set({ clipPath: clipRect });
                } else if (updates.clipShape === 'square') {
                    // Square clip centered on object
                    const clipRect = new Rect({
                        width: minDim,
                        height: minDim,
                        originX: 'center',
                        originY: 'center',
                        left: 0,
                        top: 0,
                        absolutePositioned: false,
                    });
                    obj.set({ clipPath: clipRect });
                } else {
                    // None - remove clip path
                    obj.set({ clipPath: undefined });
                }

                // Force redraw
                obj.setCoords();
            }

            activeCanvas.requestRenderAll();
        }
    }, [getCanvas]);

    // Stubs
    // Texture Handler
    const handleUpdateTexture = useCallback((texture: "none" | "grain" | "paper") => {
        setActiveTexture(texture);
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;

        // Remove existing texture for THIS page
        const existingTextures = activeCanvas.getObjects().filter((o) => (o as any).isTextureOverlay && (o as any).pageId === activePageId);
        existingTextures.forEach(t => activeCanvas.remove(t));

        if (texture === "none") {
            activeCanvas.requestRenderAll();
            return;
        }

        // Add Overlay Scoped to Page
        const offset = getActivePageOffset();

        // Simulating texture with semi-transparent Rect for now
        const overlay = new Rect({
            left: offset.x,
            top: offset.y,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            fill: texture === 'grain' ? '#000000' : '#f5f5dc',
            opacity: texture === 'grain' ? 0.1 : 0.2,
            selectable: false,
            evented: false,
            excludeFromExport: true
        });

        (overlay as any).isTextureOverlay = true;
        (overlay as any).pageId = activePageId; // Bind to page

        activeCanvas.add(overlay);
        activeCanvas.bringObjectToFront(overlay);
        activeCanvas.requestRenderAll();

    }, [getCanvas, activePageId, getActivePageOffset]);

    // SVG Handler
    const handleAddSvg = useCallback(async (url: string) => {
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;
        const offset = getActivePageOffset();

        try {
            const { objects: svgObjects, options } = await loadSVGFromURL(url);
            // Group them if multiple
            const loadedObject = util.groupSVGElements(svgObjects.filter(o => !!o) as FabricObject[], options);

            loadedObject.set({
                left: 100 + offset.x,
                top: 100 + offset.y,
                scaleX: 0.5,
                scaleY: 0.5
            });
            (loadedObject as any).pageId = activePageId;

            activeCanvas.add(loadedObject);
            activeCanvas.setActiveObject(loadedObject);
            activeCanvas.requestRenderAll();

        } catch (err) {
            console.error("Failed to load SVG", err);
        }
    }, [getCanvas, activePageId, pages]);

    // Theme Handler (Scoped to Page)
    const handleUpdateTheme = useCallback((colors: string[]) => {
        // Apply to background (Page Scoped)
        if (colors.length > 0) handleUpdateBackground(colors[0]);

        // Apply to text items on THIS page only
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;

        const pageObjects = activeCanvas.getObjects().filter(o => (o as any).pageId === activePageId);
        const textObjects = pageObjects.filter(o => o.type === 'textbox' || o.type === 'i-text');

        textObjects.forEach((obj, i) => {
            // Skip background color which is index 0
            const colorIndex = (i % (colors.length - 1)) + 1;
            obj.set({ fill: colors[colorIndex] });
        });
        activeCanvas.requestRenderAll();
    }, [handleUpdateBackground, getCanvas, activePageId]);

    // Content Update (for Photo Replacement)
    const handleUpdateItemContent = useCallback(async (id: string, content: string) => {
        const activeCanvas = getCanvas("main-canvas");
        if (!activeCanvas) return;

        const obj = activeCanvas.getObjects().find(o => (o as any).customId === id || (o as any).id === id || o === selectedObject);
        if (!obj) return;

        if (obj.type === 'image') {
            // Replace image source
            try {
                const imgElement = await FabricImage.fromURL(content, { crossOrigin: "anonymous" });
                // Maintain dimensions
                const width = obj.width! * obj.scaleX!;
                const height = obj.height! * obj.scaleY!;

                (obj as FabricImage).setElement(imgElement.getElement() as HTMLImageElement);
                (obj as FabricImage).set({
                    scaleX: width / imgElement.width!,
                    scaleY: height / imgElement.height!
                });
                activeCanvas.requestRenderAll();
            } catch (e) {
                console.error("Failed to replace image", e);
            }
        }
    }, [getCanvas, selectedObject]);

    const handleUpdateLayout = () => { console.log("Layout presets coming soon"); };
    const handleUpdateBackgroundImage = () => { };
    const handleUpdateBackgroundStyle = () => { };

    // Export handler (Legacy: assumes vertical, need update for robust export?)
    // Actually the export uses explicit coordinates (top=pageY), so it might break if horizontal!
    // FIX: Update export logic to respect mode or just calculcate based on page index


    const handleExport = useCallback(async (options: { format: "png" | "jpeg" | "pdf"; scope: "current" | "all" | "custom"; pages: number[] }) => {
        const canvas = getCanvas("main-canvas");
        if (!canvas) return;

        const pagesToExport = options.scope === "current"
            ? [pages.findIndex(p => p.id === activePageId)]
            : options.scope === "all"
                ? pages.map((_, i) => i)
                : options.pages;

        const isHorizontal = layoutModeRef.current === 'horizontal';

        // 1. Save current state (Viewport + Selection + Highlights)
        const originalVpt = canvas.viewportTransform;
        const activeObject = canvas.getActiveObject();
        if (activeObject) canvas.discardActiveObject(); // Deselect to hide selection handles

        // Hide Highlights
        const frames = canvas.getObjects().filter((o: any) => o.isPageFrame);
        frames.forEach(f => f.set({ visible: false }));

        // 2. Reset to Identity
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

        try {
            if (options.format === 'pdf') {
                // PDF Export: Combine all pages into one file
                // A4 size references: 595.28 x 841.89 (Pts)
                // We use 'pt', 'px' or fit to page? 
                // Let's use custom page size matching the canvas PAGE_WIDTH/HEIGHT

                // Convert px to pts? jsPDF can take [width, height]
                const doc = new jsPDF({
                    orientation: PAGE_WIDTH > PAGE_HEIGHT ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [PAGE_WIDTH, PAGE_HEIGHT]
                });

                for (let i = 0; i < pagesToExport.length; i++) {
                    const pageIndex = pagesToExport[i];
                    if (pageIndex === -1 || !pages[pageIndex]) continue;

                    if (i > 0) doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

                    const left = isHorizontal ? pageIndex * (PAGE_WIDTH + PAGE_GAP) : 0;
                    const top = isHorizontal ? 0 : pageIndex * (PAGE_HEIGHT + PAGE_GAP);

                    // ULTRA High Quality Capture (4x = Retina/Print Quality)
                    // Note: This might be slower but ensures sharpness
                    const dataURL = canvas.toDataURL({
                        format: "png",
                        quality: 1,
                        multiplier: 4,
                        left, top, width: PAGE_WIDTH, height: PAGE_HEIGHT
                    });

                    doc.addImage(dataURL, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
                }

                doc.save(`${id}-export.pdf`);

            } else {
                // Image Export: Download individually
                for (const pageIndex of pagesToExport) {
                    if (pageIndex === -1 || !pages[pageIndex]) continue;

                    const left = isHorizontal ? pageIndex * (PAGE_WIDTH + PAGE_GAP) : 0;
                    const top = isHorizontal ? 0 : pageIndex * (PAGE_HEIGHT + PAGE_GAP);

                    const dataURL = canvas.toDataURL({
                        format: options.format,
                        quality: 1,
                        multiplier: 4,
                        left, top, width: PAGE_WIDTH, height: PAGE_HEIGHT
                    });

                    const link = document.createElement("a");
                    link.download = `${id}-page-${pageIndex + 1}.${options.format}`;
                    link.href = dataURL;
                    link.click();

                    // Small delay to prevent browser blocking multiple downloads
                    await new Promise(r => setTimeout(r, 200));
                }
            }
        } finally {
            // 3. Restore original state
            frames.forEach(f => f.set({ visible: true }));

            if (originalVpt) {
                canvas.setViewportTransform(originalVpt);
            }
            if (activeObject) {
                canvas.setActiveObject(activeObject);
            }
            canvas.requestRenderAll();
        }
    }, [pages, activePageId, getCanvas, id]);


    if (!template || isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading editor...</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
            {/* Sidebar (Bottom Nav on Mobile) */}
            <EditorSidebar activeTool={activeTool} onSelectTool={setActiveTool} />

            {/* Tool Panel Drawer */}
            <ToolPanel
                isOpen={!!activeTool}
                activeTool={activeTool}
                onAddText={handleAddText}
                onUpdateBackground={handleUpdateBackground}
                onUpdateTheme={handleUpdateTheme}
                onUpdateTexture={handleUpdateTexture}
                activeTexture={activeTexture}
                onUpdateLayout={handleUpdateLayout}
                activeLayout={activeLayout}
                onAddImage={handleAddImage}
                onAddShape={handleAddShape}
                onAddSvg={handleAddSvg}
                onUpdateItemContent={handleUpdateItemContent}
                activeItem={selectedObject}
                onUpdateItemStyle={handleUpdateItemStyle}
                onUpdateBackgroundImage={handleUpdateBackgroundImage}
                onUpdateBackgroundStyle={handleUpdateBackgroundStyle}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Desktop Bar */}
                <header className="absolute top-0 left-0 w-full h-14 border-b border-border flex items-center justify-between px-4 md:px-6 z-30 bg-background/80 backdrop-blur-md pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-4">
                        <button
                            onClick={() => handleNavigation("/projects")}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-manrope text-sm hidden md:inline">Projects</span>
                        </button>
                        <div className="h-6 w-px bg-border hidden md:block" />
                        <h1 className="font-bebas text-xl tracking-wide truncate max-w-[150px] md:max-w-none">
                            {renderSource?.type === 'project' ? (renderSource.data as any).name : template?.name || "Editor"}
                        </h1>
                        {isDirty && (
                            <span className="text-xs text-muted-foreground">(unsaved)</span>
                        )}
                    </div>

                    <div className="pointer-events-auto flex items-center gap-3">
                        {/* Save Button - Only for Projects */}
                        {renderSource?.type === 'project' && (
                            <button
                                onClick={handleSave}
                                disabled={!isDirty || isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black font-semibold rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <Save className="w-4 h-4" />
                                <span className="hidden md:inline">{isSaving ? "Saving..." : "Save"}</span>
                            </button>
                        )}
                        <ThemeToggle />
                        <ExportButton
                            totalPages={pages.length}
                            currentPageIndex={pages.findIndex(p => p.id === activePageId)}
                            onExport={handleExport}
                        />
                    </div>
                </header>

                {/* THE INFINITE CANVAS */}
                <div className="flex-1 relative bg-muted/30">
                    <FabricCanvas
                        pages={pages}
                        activePageId={activePageId}
                        onPageClick={setActivePageId}
                        onSelectionChange={handleSelectionChange}
                        onModified={() => setIsDirty(true)}
                        onReady={handleCanvasReady}
                        layoutMode={isMobile ? "horizontal" : "vertical"}
                    />

                    {/* Add Page Floating Button */}
                    <div className="absolute bottom-24 md:bottom-8 right-6 md:right-8 pointer-events-auto z-20">
                        <button
                            onClick={addPage}
                            className="w-12 h-12 rounded-full bg-lime-400 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                            title="Add Page"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onSave={handleModalSave}
                onDiscard={handleModalDiscard}
                onCancel={handleModalCancel}
                isSaving={isSaving}
            />
        </div>
    );
}
