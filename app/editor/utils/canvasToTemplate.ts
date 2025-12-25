/**
 * Converts Fabric.js canvas objects to the structured template JSON format
 * used by the limits template system.
 */

import type { Canvas, FabricObject } from "fabric";
import { PAGE_HEIGHT, PAGE_GAP } from "../components/FabricCanvas";

interface TemplateElement {
    type: string;
    content?: string;
    position: {
        x: number | "center";
        y: number;
        width?: number;
        height?: number;
    };
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: string;
    lineHeight?: number;
    charSpacing?: number;
    fontWeight?: string;
    fontStyle?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    angle?: number;
    src?: string | { query: string; provider: string };
    shape?: string;
    clipShape?: string;
    scale?: number;
}

interface TemplatePage {
    id: string;
    background?: string;
    elements: TemplateElement[];
}

export interface TemplateJSON {
    id: string;
    name: string;
    version: string;
    meta: {
        category: string;
        orientation: string;
        savedAt?: string;
    };
    style: {
        background: string;
        fonts?: {
            heading?: string;
            body?: string;
        };
        colors?: {
            primary?: string;
            secondary?: string;
            accent?: string;
        };
    };
    pages: TemplatePage[];
}

/**
 * Convert a Fabric canvas to our structured template JSON format.
 * @param canvas - The Fabric.js canvas instance
 * @param projectName - Name of the project
 * @param projectId - ID of the project
 * @param pages - Array of page data with IDs and backgrounds
 */
export function canvasToTemplateJSON(
    canvas: Canvas,
    projectName: string,
    projectId: string,
    pages: { id: string; backgroundColor?: string }[],
    layoutMode: "vertical" | "horizontal" = "vertical"
): TemplateJSON {
    const objects = canvas.getObjects().filter((obj) => {
        // Exclude internal UI elements
        const isInternal =
            (obj as any).isPageBackground ||
            (obj as any).isPageFrame ||
            (obj as any).isSmartGuide ||
            (obj as any).id?.startsWith('grid-');
        return !isInternal;
    });

    // Group objects by page
    const pageObjects: Map<number, FabricObject[]> = new Map();

    objects.forEach((obj) => {
        // Determine which page this object belongs to based on position & layout mode
        let pageIndex = 0;

        if (layoutMode === "horizontal") {
            const objLeft = obj.left || 0;
            const pageWidthWithGap = 595 + 60; // WIDTH(595) + GAP(60) - Importing constants would be better but circular dep risk?
            // Re-use logic from FabricCanvas logic if possible, or just use hard values matching FabricCanvas.
            // In FabricCanvas: PAGE_WIDTH=595, PAGE_GAP=60.
            pageIndex = Math.floor(objLeft / pageWidthWithGap);
        } else {
            const objTop = obj.top || 0;
            const pageHeightWithGap = 842 + 60; // HEIGHT(842) + GAP(60)
            pageIndex = Math.floor(objTop / pageHeightWithGap);
        }

        if (!pageObjects.has(pageIndex)) {
            pageObjects.set(pageIndex, []);
        }
        pageObjects.get(pageIndex)!.push(obj);
    });

    // Build pages array
    const templatePages: TemplatePage[] = pages.map((page, index) => {
        const pageObjs = pageObjects.get(index) || [];

        // Calculate offsets based on Layout Mode
        let pageXOffset = 0;
        let pageYOffset = 0;

        if (layoutMode === "horizontal") {
            pageXOffset = index * (595 + 60);
        } else {
            pageYOffset = index * (842 + 60);
        }

        const elements: TemplateElement[] = pageObjs.map((obj) => {
            return fabricObjectToElement(obj, pageXOffset, pageYOffset);
        });

        return {
            id: page.id,
            background: page.backgroundColor,
            elements: elements,
        };
    });

    // ... (rest remains the same)

    // Determine background color from first page or default
    const backgroundColor = pages[0]?.backgroundColor || "#121212";

    return {
        id: projectId,
        name: projectName,
        version: "1.0",
        meta: {
            category: "Custom",
            orientation: "portrait",
            savedAt: new Date().toISOString(),
        },
        style: {
            background: backgroundColor,
        },
        pages: templatePages,
    };
}

/**
 * Convert a single Fabric object to a template element.
 */
function fabricObjectToElement(obj: FabricObject, pageXOffset: number, pageYOffset: number): TemplateElement {
    const type = obj.type || "unknown";

    // Normalize position to Top-Left origin to match Loader defaults
    // This prevents center-origin objects from shifting right when loaded
    const p = obj.getPointByOrigin("left", "top");
    const left = p.x - pageXOffset;
    const top = p.y - pageYOffset;

    const width = obj.width ? obj.width * (obj.scaleX || 1) : undefined;
    const height = obj.height ? obj.height * (obj.scaleY || 1) : undefined;

    const baseElement: TemplateElement = {
        type: mapFabricTypeToTemplateType(type),
        position: {
            x: Math.round(left),
            y: Math.round(top),
            width: width ? Math.round(width) : undefined,
            height: height ? Math.round(height) : undefined,
        },
    };

    // Handle text objects
    if (type === "textbox" || type === "text" || type === "i-text") {
        const textObj = obj as any;
        baseElement.type = "text";
        baseElement.content = textObj.text || "";
        baseElement.fontSize = textObj.fontSize;
        baseElement.fontFamily = textObj.fontFamily;
        baseElement.color = textObj.fill as string;
        baseElement.textAlign = textObj.textAlign;
        baseElement.lineHeight = textObj.lineHeight;
        baseElement.charSpacing = textObj.charSpacing;
        if (textObj.fontWeight && textObj.fontWeight !== "normal") {
            baseElement.fontWeight = textObj.fontWeight;
        }
        if (textObj.fontStyle && textObj.fontStyle !== "normal") {
            baseElement.fontStyle = textObj.fontStyle;
        }
    }

    // Handle shape objects
    if (type === "rect" || type === "circle" || type === "line" || type === "polygon") {
        baseElement.type = "shape";
        baseElement.shape = type;
        baseElement.fill = obj.fill as string;
        if (obj.stroke) {
            baseElement.stroke = obj.stroke as string;
            baseElement.strokeWidth = obj.strokeWidth;
        }
    }

    // Handle image objects
    if (type === "image") {
        const imgObj = obj as any;
        baseElement.type = "image";
        // Try to get the source URL
        if (imgObj._element && imgObj._element.src) {
            baseElement.src = imgObj._element.src;
        } else if (imgObj.src) {
            baseElement.src = imgObj.src;
        }
        // Check for clip shape
        if ((obj as any).clipShape) {
            baseElement.clipShape = (obj as any).clipShape;
        }
    }

    // Common properties
    if (obj.opacity !== undefined && obj.opacity !== 1) {
        baseElement.opacity = obj.opacity;
    }
    if (obj.angle && obj.angle !== 0) {
        baseElement.angle = obj.angle;
    }

    return baseElement;
}

/**
 * Map Fabric.js type to our template type.
 */
function mapFabricTypeToTemplateType(fabricType: string): string {
    switch (fabricType) {
        case "textbox":
        case "text":
        case "i-text":
            return "text";
        case "rect":
        case "circle":
        case "line":
        case "polygon":
        case "path":
            return "shape";
        case "image":
            return "image";
        case "group":
            return "group";
        default:
            return fabricType;
    }
}
