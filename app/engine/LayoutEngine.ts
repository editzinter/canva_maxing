/**
 * LayoutEngine.ts - Auto-Layout System for V3 Templates
 * 
 * Calculates positions at render time so AI doesn't need to predict coordinates.
 * Supports: stack (vertical), columns (horizontal split), absolute (legacy)
 */

import { Canvas, FabricObject, Textbox, Rect, FabricImage, Group, Circle, Ellipse, Triangle } from "fabric";

// ============================================================================
// DEFAULT CONSTANTS (replace magic numbers)
// ============================================================================

// Text defaults
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_FAMILY = "Arial";
const DEFAULT_TEXT_COLOR = "#000000";
const DEFAULT_LINE_HEIGHT = 1.2;

// Shape/Divider defaults
const DEFAULT_SHAPE_HEIGHT = 2;
const DEFAULT_SHAPE_COLOR = "#000000";

// Image defaults
const DEFAULT_IMAGE_HEIGHT = 150;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_STROKE_COLOR = "#ffffff";

// Layout defaults
const DEFAULT_GAP = 16;
const DEFAULT_GRID_COLS = 2;
const MAX_CENTERED_WIDTH = 400;
const DEFAULT_SPACER_HEIGHT = 20;

// ============================================================================
// TYPES
// ============================================================================

export interface LayoutNode {
    // Layout type
    layout?: "stack" | "columns" | "row" | "grid" | "centered" | "spacer" | "absolute" | "relative";

    // Layout properties
    padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    gap?: number;
    align?: "left" | "center" | "right";
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly";  // For row layout
    wrap?: boolean;  // For row layout - wrap to next line when full

    // Column-specific - array of fractional units, e.g., [1, 2] = 1fr + 2fr
    columnWidths?: number[];

    // Grid-specific
    gridCols?: number;   // Number of columns for grid layout

    // Sizing
    width?: number | string;    // Fixed width or "auto"
    height?: number;            // Fixed height
    minWidth?: number;          // Minimum width constraint
    maxWidth?: number;          // Maximum width constraint
    grow?: number;              // Flex-grow factor (1 = fill remaining space)

    // Z-Index for stacking order
    zIndex?: number;

    // Rotation in degrees
    rotation?: number;  // e.g., 45 = 45 degrees clockwise

    // Children (for containers)
    children?: LayoutNode[];

    // Element properties (for leaf nodes)
    use?: string;       // Component reference
    type?: string;      // Direct element type
    props?: Record<string, any>;

    // Absolute/relative positioning within parent container
    // Use these to position an element relative to its calculated position
    // e.g., bottom: 0 places at bottom, top: -20 overlaps previous element
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;

    // Explicit x/y positioning for absolute layout
    x?: number | "center";
    y?: number;

    // Legacy absolute positioning (V2 compatibility)
    position?: {
        x?: number | "center";
        y?: number;
        width?: number;
        height?: number;
    };

    // Page background color (for pages)
    background?: string;
}

export interface LayoutContext {
    canvas: Canvas;
    tokens: Record<string, any>;
    components: Record<string, any>;
    canvasWidth: number;
    canvasHeight: number;
    pageOffsetY: number;    // For multi-page support
    pageId?: string;        // Page ID for object tagging
}

export interface LayoutResult {
    width: number;
    height: number;
    objects: FabricObject[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse padding into { top, right, bottom, left }
 */
function parsePadding(padding?: number | { top?: number; right?: number; bottom?: number; left?: number }) {
    if (typeof padding === "number") {
        return { top: padding, right: padding, bottom: padding, left: padding };
    }
    return {
        top: padding?.top ?? 0,
        right: padding?.right ?? 0,
        bottom: padding?.bottom ?? 0,
        left: padding?.left ?? 0,
    };
}

/**
 * Resolve token references like "$colors.primary"
 */
function resolveToken(value: any, tokens: Record<string, any>): any {
    if (typeof value !== "string" || !value.startsWith("$")) {
        return value;
    }

    const path = value.slice(1).split(".");
    let result = tokens;
    for (const key of path) {
        result = result?.[key];
    }
    return result ?? value;
}

/**
 * Resolve all props with token references
 */
function resolveProps(props: Record<string, any>, tokens: Record<string, any>): Record<string, any> {
    const resolved: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
        resolved[key] = resolveToken(value, tokens);
    }
    return resolved;
}

/**
 * Apply a shape clip path to the canvas context
 * Supports: rect, circle, ellipse, hexagon, diamond, triangle, star, pentagon, octagon
 */
function applyShapeClip(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    shape: string,
    cornerRadius: number = 0
): void {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2;

    ctx.beginPath();

    switch (shape) {
        case 'circle':
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            break;

        case 'ellipse':
            ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, Math.PI * 2);
            break;

        case 'hexagon':
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;

        case 'pentagon':
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;

        case 'octagon':
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i - Math.PI / 8;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;

        case 'diamond':
            ctx.moveTo(cx, 0);
            ctx.lineTo(width, cy);
            ctx.lineTo(cx, height);
            ctx.lineTo(0, cy);
            ctx.closePath();
            break;

        case 'triangle':
            ctx.moveTo(cx, 0);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            break;

        case 'star':
            const outerR = r;
            const innerR = r * 0.4;
            for (let i = 0; i < 10; i++) {
                const radius = i % 2 === 0 ? outerR : innerR;
                const angle = (Math.PI / 5) * i - Math.PI / 2;
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;

        case 'rounded':
        case 'rect':
        default:
            if (cornerRadius > 0) {
                ctx.roundRect(0, 0, width, height, cornerRadius);
            } else {
                ctx.rect(0, 0, width, height);
            }
            break;
    }

    ctx.clip();
}

/**
 * Create a cropped image canvas with exact dimensions and shape clipping
 * This ensures Fabric.js will have correct selection bounds
 */
async function createCroppedImageDataURL(
    srcUrl: string,
    targetWidth: number,
    targetHeight: number,
    shape: string = 'rect',
    cornerRadius: number = 0
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            // Create temp canvas with exact target dimensions
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Could not create canvas context"));
                return;
            }

            // Calculate cover crop (center the image)
            const imgAspect = img.width / img.height;
            const targetAspect = targetWidth / targetHeight;

            let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

            if (imgAspect > targetAspect) {
                // Image is wider - crop sides
                srcW = img.height * targetAspect;
                srcX = (img.width - srcW) / 2;
            } else {
                // Image is taller - crop top/bottom
                srcH = img.width / targetAspect;
                srcY = (img.height - srcH) / 2;
            }

            // Apply shape clipping
            applyShapeClip(ctx, targetWidth, targetHeight, shape, cornerRadius);

            // Draw the cropped & scaled image
            ctx.drawImage(
                img,
                srcX, srcY, srcW, srcH,  // Source crop
                0, 0, targetWidth, targetHeight  // Destination (full canvas)
            );

            // Export as dataURL
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            reject(new Error(`Failed to load image: ${srcUrl}`));
        };

        img.src = srcUrl;
    });
}

/**
 * Merge component defaults with instance props
 */
function mergeWithComponent(node: LayoutNode, components: Record<string, any>): LayoutNode {
    if (!node.use || !components[node.use]) {
        return node;
    }

    const component = components[node.use];
    return {
        ...node,
        type: component.type,
        props: { ...component.props, ...node.props },
    };
}

// ============================================================================
// ELEMENT CREATION
// ============================================================================

/**
 * Create a Fabric.js object from a layout node
 */
async function createElement(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<FabricObject | null> {
    const merged = mergeWithComponent(node, ctx.components);
    const props = resolveProps(merged.props || {}, ctx.tokens);

    const type = merged.type;

    if (type === "text") {
        const textbox = new Textbox(props.content || "", {
            left: x,
            top: y,
            width: availableWidth,
            fontSize: props.fontSize || DEFAULT_FONT_SIZE,
            fontFamily: resolveToken(props.fontFamily, ctx.tokens) || DEFAULT_FONT_FAMILY,
            fill: resolveToken(props.color, ctx.tokens) || DEFAULT_TEXT_COLOR,
            textAlign: props.textAlign || "left",
            lineHeight: props.lineHeight || DEFAULT_LINE_HEIGHT,
            fontWeight: props.fontWeight || "normal",
            fontStyle: props.fontStyle || "normal",
            charSpacing: props.charSpacing || 0,
            selectable: true,
        });
        // Tag with pageId for theme updates
        (textbox as any).pageId = ctx.pageId;
        return textbox;
    }

    if (type === "shape") {
        const shapeType = props.shape || "rect";
        const fill = resolveToken(props.fill, ctx.tokens) || DEFAULT_SHAPE_COLOR;
        const width = props.width || availableWidth;
        const height = props.height || DEFAULT_SHAPE_HEIGHT;
        const opacity = props.opacity ?? 1;

        let fabricShape: FabricObject | null = null;

        if (shapeType === "rect") {
            fabricShape = new Rect({
                left: x,
                top: y,
                width,
                height,
                fill,
                rx: props.rx || 0,
                ry: props.ry || 0,
                opacity,
                selectable: true,
            });
        } else if (shapeType === "circle") {
            // Circle uses radius (half of width/height)
            const radius = Math.min(width, height) / 2;
            fabricShape = new Circle({
                left: x,
                top: y,
                radius,
                fill,
                opacity,
                selectable: true,
            });
        } else if (shapeType === "ellipse") {
            fabricShape = new Ellipse({
                left: x,
                top: y,
                rx: width / 2,
                ry: height / 2,
                fill,
                opacity,
                selectable: true,
            });
        } else if (shapeType === "triangle") {
            fabricShape = new Triangle({
                left: x,
                top: y,
                width,
                height,
                fill,
                opacity,
                selectable: true,
            });
        }

        if (fabricShape) {
            (fabricShape as any).pageId = ctx.pageId;
            return fabricShape;
        }
    }

    if (type === "image") {
        try {
            // Determine target dimensions and shape
            const targetWidth = props.width || availableWidth;
            const targetHeight = props.height || DEFAULT_IMAGE_HEIGHT;
            const shape = props.shape || 'rect';  // circle, hexagon, diamond, triangle, star, etc.
            const cornerRadius = props.cornerRadius || props.rx || 0;

            // Use temp canvas approach for correct selection bounds
            const croppedDataURL = await createCroppedImageDataURL(
                props.src,
                targetWidth,
                targetHeight,
                shape,
                cornerRadius
            );

            // Create FabricImage from the pre-cropped canvas
            const img = await FabricImage.fromURL(croppedDataURL, { crossOrigin: "anonymous" });

            // Position the image
            img.set({
                left: x,
                top: y,
                selectable: true,
            });

            // Handle stroke for shaped images
            // Fabric.js stroke on FabricImage is always rectangular, so for non-rect shapes
            // we need to create a separate stroke ring
            if ((props.stroke || props.strokeWidth) && shape !== 'rect') {
                const strokeColor = resolveToken(props.stroke, ctx.tokens) || DEFAULT_STROKE_COLOR;
                const strokeW = props.strokeWidth || DEFAULT_STROKE_WIDTH;

                if (shape === 'circle') {
                    // Create a circle stroke ring behind the image
                    const radius = Math.min(targetWidth, targetHeight) / 2;
                    const strokeCircle = new Circle({
                        left: x + targetWidth / 2,
                        top: y + targetHeight / 2,
                        radius: radius,
                        fill: 'transparent',
                        stroke: strokeColor,
                        strokeWidth: strokeW,
                        originX: 'center',
                        originY: 'center',
                        selectable: false,
                        evented: false,
                    });
                    (strokeCircle as any).pageId = ctx.pageId;
                    (strokeCircle as any).isStrokeOverlay = true;

                    // Group the image and stroke together
                    const group = new Group([strokeCircle, img], {
                        left: x,
                        top: y,
                        selectable: true,
                    });
                    (group as any).pageId = ctx.pageId;
                    return group;
                } else if (shape === 'ellipse') {
                    // Create an ellipse stroke ring
                    const strokeEllipse = new Ellipse({
                        left: x + targetWidth / 2,
                        top: y + targetHeight / 2,
                        rx: targetWidth / 2,
                        ry: targetHeight / 2,
                        fill: 'transparent',
                        stroke: strokeColor,
                        strokeWidth: strokeW,
                        originX: 'center',
                        originY: 'center',
                        selectable: false,
                        evented: false,
                    });
                    (strokeEllipse as any).pageId = ctx.pageId;
                    (strokeEllipse as any).isStrokeOverlay = true;

                    const group = new Group([strokeEllipse, img], {
                        left: x,
                        top: y,
                        selectable: true,
                    });
                    (group as any).pageId = ctx.pageId;
                    return group;
                }
                // For other shapes, fall back to rectangular stroke (not ideal but works)
                img.set({
                    stroke: strokeColor,
                    strokeWidth: strokeW,
                });
            } else if (props.stroke || props.strokeWidth) {
                // Rectangular stroke - use Fabric's native stroke
                img.set({
                    stroke: resolveToken(props.stroke, ctx.tokens) || DEFAULT_STROKE_COLOR,
                    strokeWidth: props.strokeWidth || DEFAULT_STROKE_WIDTH,
                });
            }

            // Tag with pageId
            (img as any).pageId = ctx.pageId;

            return img;
        } catch (e) {
            console.warn("[LayoutEngine] Failed to load image:", props.src, e);
            return null;
        }
    }

    console.warn(`[LayoutEngine] Unknown element type: ${type}`);
    return null;
}

// ============================================================================
// LAYOUT RENDERING
// ============================================================================

/**
 * Render a stack layout (vertical flow)
 * Children can use top/left offsets for overlapping
 */
async function renderStack(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<LayoutResult> {
    const padding = parsePadding(node.padding);
    const gap = node.gap ?? 0;
    const children = node.children ?? [];

    const contentX = x + padding.left;
    const contentWidth = availableWidth - padding.left - padding.right;
    let currentY = y + padding.top;

    const objects: FabricObject[] = [];
    let lastChildHeight = 0;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // Calculate position with offsets
        let childX = contentX;
        let childY = currentY;

        // Apply position offsets for overlapping
        if (child.top !== undefined) {
            childY += child.top;  // Negative value = overlap previous element
        }
        if (child.left !== undefined) {
            childX += child.left;
        }
        // Note: right offset applied after measuring child
        const rightOffset = child.right ?? 0;

        const result = await renderNode(child, ctx, childX, childY, contentWidth);

        // Track object indices for this child
        const childObjStartIdx = objects.length;

        // Apply right offset - shift elements from right edge
        if (rightOffset !== 0) {
            for (const obj of result.objects) {
                const objWidth = (obj.width ?? 0) * (obj.scaleX ?? 1);
                obj.set({ left: contentX + contentWidth - objWidth - rightOffset });
            }
        }

        // Store objects with child metadata for bottom positioning
        for (const obj of result.objects) {
            (obj as any).__childIndex = i;
            (obj as any).__childBottom = child.bottom;
            objects.push(obj);
        }

        // Only advance Y if not absolutely positioned (no offset)
        // If child has negative top, don't fully advance (overlap)
        const effectiveHeight = child.top !== undefined && child.top < 0
            ? Math.max(0, result.height + child.top)
            : result.height;

        currentY += effectiveHeight + gap;
        lastChildHeight = result.height;
    }

    // Remove last gap
    if (children.length > 0) {
        currentY -= gap;
    }

    // Use explicit height if provided, otherwise use calculated
    const containerHeight = node.height ?? (currentY - y + padding.bottom);

    // Second pass: apply bottom positioning (requires knowing container height)
    for (const obj of objects) {
        const childBottom = (obj as any).__childBottom;
        if (childBottom !== undefined) {
            // Bottom positioning: offset from container bottom edge
            const objHeight = (obj.height ?? 0) * (obj.scaleY ?? 1);
            const bottomY = y + containerHeight - padding.bottom - objHeight - childBottom;
            obj.set({ top: bottomY });
        }
        // Clean up metadata
        delete (obj as any).__childIndex;
        delete (obj as any).__childBottom;
    }

    return {
        width: availableWidth,
        height: containerHeight,
        objects,
    };
}

/**
 * Render a columns layout (horizontal split)
 * Supports variable widths via columnWidths prop (fractional units)
 * e.g., columnWidths: [1, 2] = 1fr + 2fr (33% + 66%)
 */
async function renderColumns(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<LayoutResult> {
    const padding = parsePadding(node.padding);
    const gap = node.gap ?? 0;
    const children = node.children ?? [];

    if (children.length === 0) {
        return { width: availableWidth, height: 0, objects: [] };
    }

    const contentX = x + padding.left;
    const contentY = y + padding.top;
    const contentWidth = availableWidth - padding.left - padding.right;

    // Calculate column widths - supports fractional units
    const totalGaps = (children.length - 1) * gap;
    const availableForColumns = contentWidth - totalGaps;

    // If columnWidths specified, use fractional distribution
    // Otherwise, equal widths
    let columnWidths: number[];
    if (node.columnWidths && node.columnWidths.length === children.length) {
        const totalFractions = node.columnWidths.reduce((a, b) => a + b, 0);
        columnWidths = node.columnWidths.map(fr => (fr / totalFractions) * availableForColumns);
    } else {
        const equalWidth = availableForColumns / children.length;
        columnWidths = children.map(() => equalWidth);
    }

    const objects: FabricObject[] = [];
    let maxHeight = 0;
    let currentX = contentX;

    for (let i = 0; i < children.length; i++) {
        const colWidth = columnWidths[i];
        const result = await renderNode(children[i], ctx, currentX, contentY, colWidth);
        objects.push(...result.objects);
        maxHeight = Math.max(maxHeight, result.height);
        currentX += colWidth + gap;
    }

    const totalHeight = maxHeight + padding.top + padding.bottom;

    return {
        width: availableWidth,
        height: totalHeight,
        objects,
    };
}

/**
 * Render a row layout (horizontal flow, like flexbox row)
 * Items flow left-to-right with optional justify
 * Supports: start, center, end, between, around, evenly
 * wrap: true enables multi-line wrapping
 * grow: children with grow:1 fill remaining space
 */
async function renderRow(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<LayoutResult> {
    const padding = parsePadding(node.padding);
    const gap = node.gap ?? 0;
    const children = node.children ?? [];
    const justify = node.justify ?? "start";
    const wrap = node.wrap ?? false;

    if (children.length === 0) {
        return { width: availableWidth, height: 0, objects: [] };
    }

    const contentX = x + padding.left;
    const contentY = y + padding.top;
    const contentWidth = availableWidth - padding.left - padding.right;

    // First pass: render children to measure and calculate grow
    interface ChildData {
        result: LayoutResult;
        width: number;
        height: number;
        grow: number;
        child: LayoutNode;
    }
    const childData: ChildData[] = [];
    let totalFixedWidth = 0;
    let totalGrow = 0;

    for (const child of children) {
        const grow = child.grow ?? 0;
        totalGrow += grow;

        // For grow items, render with minimal width first to measure
        const measureWidth = typeof child.width === 'number' ? child.width : 100;
        const result = await renderNode(child, ctx, 0, 0, measureWidth);

        const childWidth = typeof child.width === 'number'
            ? child.width
            : (grow > 0 ? 0 : result.width);  // Grow items get 0 initially

        childData.push({ result, width: childWidth, height: result.height, grow, child });
        if (grow === 0) totalFixedWidth += childWidth;
    }

    // Calculate remaining space for grow items
    const totalGapSpace = (children.length - 1) * gap;
    const remainingSpace = Math.max(0, contentWidth - totalFixedWidth - totalGapSpace);

    // Distribute remaining space to grow items
    if (totalGrow > 0) {
        for (const item of childData) {
            if (item.grow > 0) {
                item.width = (item.grow / totalGrow) * remainingSpace;
                // Re-render with correct width
                item.result = await renderNode(item.child, ctx, 0, 0, item.width);
                item.height = item.result.height;
            }
        }
    }

    const objects: FabricObject[] = [];

    if (wrap) {
        // Wrapping mode: distribute children across multiple lines
        const lines: { items: ChildData[]; totalWidth: number; maxHeight: number }[] = [];
        let currentLine: ChildData[] = [];
        let currentLineWidth = 0;

        for (const item of childData) {
            const itemWidthWithGap = item.width + (currentLine.length > 0 ? gap : 0);

            if (currentLineWidth + itemWidthWithGap > contentWidth && currentLine.length > 0) {
                // Start new line
                lines.push({
                    items: currentLine,
                    totalWidth: currentLineWidth,
                    maxHeight: Math.max(...currentLine.map(c => c.height))
                });
                currentLine = [item];
                currentLineWidth = item.width;
            } else {
                currentLine.push(item);
                currentLineWidth += itemWidthWithGap;
            }
        }
        // Add final line
        if (currentLine.length > 0) {
            lines.push({
                items: currentLine,
                totalWidth: currentLineWidth,
                maxHeight: Math.max(...currentLine.map(c => c.height))
            });
        }

        // Position each line
        let lineY = contentY;
        for (const line of lines) {
            let lineX = contentX;

            // Apply justify to this line
            const lineRemainingSpace = contentWidth - line.totalWidth;
            if (justify === "center") lineX += lineRemainingSpace / 2;
            else if (justify === "end") lineX += lineRemainingSpace;

            for (const item of line.items) {
                for (const obj of item.result.objects) {
                    obj.set({ left: (obj.left ?? 0) + lineX, top: (obj.top ?? 0) + lineY });
                    objects.push(obj);
                }
                lineX += item.width + gap;
            }
            lineY += line.maxHeight + gap;
        }

        const totalHeight = lineY - contentY - gap + padding.top + padding.bottom;
        return { width: availableWidth, height: Math.max(0, totalHeight), objects };
    }

    // Non-wrapping mode: single line with justify
    let totalChildWidth = childData.reduce((sum, c) => sum + c.width, 0);
    let currentX = contentX;
    let itemGap = gap;
    let startOffset = 0;

    const spaceForJustify = contentWidth - totalChildWidth - totalGapSpace;

    switch (justify) {
        case "center":
            startOffset = spaceForJustify / 2;
            break;
        case "end":
            startOffset = spaceForJustify;
            break;
        case "between":
            if (children.length > 1) {
                itemGap = (contentWidth - totalChildWidth) / (children.length - 1);
            }
            break;
        case "around":
            if (children.length > 0) {
                const spacePerItem = (contentWidth - totalChildWidth) / children.length;
                itemGap = spacePerItem;
                startOffset = spacePerItem / 2;
            }
            break;
        case "evenly":
            if (children.length > 0) {
                const spaceSize = (contentWidth - totalChildWidth) / (children.length + 1);
                itemGap = spaceSize;
                startOffset = spaceSize;
            }
            break;
    }

    currentX += startOffset;
    let maxHeight = 0;

    for (const item of childData) {
        for (const obj of item.result.objects) {
            obj.set({ left: (obj.left ?? 0) + currentX, top: (obj.top ?? 0) + contentY });
            objects.push(obj);
        }
        maxHeight = Math.max(maxHeight, item.height);
        currentX += item.width + itemGap;
    }

    return {
        width: availableWidth,
        height: maxHeight + padding.top + padding.bottom,
        objects,
    };
}

/**
 * Render a grid layout (rows and columns)
 */
async function renderGrid(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<LayoutResult> {
    const padding = parsePadding(node.padding);
    const gap = node.gap ?? DEFAULT_GAP;
    const children = node.children ?? [];
    const cols = node.gridCols ?? DEFAULT_GRID_COLS;

    if (children.length === 0) {
        return { width: availableWidth, height: 0, objects: [] };
    }

    const contentX = x + padding.left;
    const contentY = y + padding.top;
    const contentWidth = availableWidth - padding.left - padding.right;

    const colWidth = (contentWidth - (cols - 1) * gap) / cols;

    const objects: FabricObject[] = [];
    let currentY = contentY;
    let rowMaxHeight = 0;

    for (let i = 0; i < children.length; i++) {
        const col = i % cols;
        const colX = contentX + col * (colWidth + gap);

        // Start new row
        if (col === 0 && i > 0) {
            currentY += rowMaxHeight + gap;
            rowMaxHeight = 0;
        }

        const result = await renderNode(children[i], ctx, colX, currentY, colWidth);
        objects.push(...result.objects);
        rowMaxHeight = Math.max(rowMaxHeight, result.height);
    }

    const totalHeight = (currentY - contentY) + rowMaxHeight + padding.top + padding.bottom;

    return {
        width: availableWidth,
        height: totalHeight,
        objects,
    };
}

/**
 * Render a centered layout (content centered horizontally AND vertically)
 * For vertical centering, specify height (or uses canvasHeight for full-page mode)
 */
async function renderCentered(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<LayoutResult> {
    const padding = parsePadding(node.padding);
    const children = node.children ?? [];

    if (children.length === 0) {
        return { width: availableWidth, height: 0, objects: [] };
    }

    const contentWidth = availableWidth - padding.left - padding.right;
    const containerHeight = node.height ?? ctx.canvasHeight;

    // Horizontal centering
    const childWidth = Math.min(contentWidth, MAX_CENTERED_WIDTH);
    const childX = x + (availableWidth - childWidth) / 2;

    // Render as stack to measure content height first
    const stackNode: LayoutNode = {
        layout: "stack",
        gap: node.gap ?? DEFAULT_GAP,
        children: children,
    };

    // First render at y=0 to measure
    const result = await renderStack(stackNode, ctx, childX, 0, childWidth);

    // Calculate vertical offset for centering
    const availableHeight = containerHeight - padding.top - padding.bottom;
    const verticalOffset = Math.max(0, (availableHeight - result.height) / 2);
    const contentY = y + padding.top + verticalOffset;

    // Offset all objects to correct vertical position
    for (const obj of result.objects) {
        obj.set({ top: (obj.top ?? 0) + contentY });
    }

    return {
        width: availableWidth,
        height: containerHeight,
        objects: result.objects,
    };
}

/**
 * Render an absolute layout (explicit x/y positioning)
 * Children can use x/y for exact coordinates, or top/left/right/bottom for edge offsets
 */
async function renderAbsolute(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<LayoutResult> {
    const padding = parsePadding(node.padding);
    const children = node.children ?? [];
    const containerHeight = node.height ?? ctx.canvasHeight;
    // Ensure width is always a number
    const containerWidth = typeof node.width === 'number' ? node.width : availableWidth;

    if (children.length === 0) {
        return { width: containerWidth, height: containerHeight, objects: [] };
    }

    const objects: FabricObject[] = [];
    const contentX = x + padding.left;
    const contentY = y + padding.top;
    const contentWidth = containerWidth - padding.left - padding.right;
    const contentHeight = containerHeight - padding.top - padding.bottom;

    for (const child of children) {
        // Determine child position
        let childX = contentX;
        let childY = contentY;
        let childWidth = typeof child.width === 'number' ? child.width : contentWidth;

        // Handle x positioning
        if (child.x !== undefined) {
            if (child.x === "center") {
                childX = contentX + (contentWidth - childWidth) / 2;
            } else {
                childX = contentX + child.x;
            }
        } else if (child.left !== undefined) {
            childX = contentX + child.left;
        } else if (child.right !== undefined) {
            childX = contentX + contentWidth - childWidth - child.right;
        }

        // Handle y positioning
        if (child.y !== undefined) {
            childY = contentY + child.y;
        } else if (child.top !== undefined) {
            childY = contentY + child.top;
        } else if (child.bottom !== undefined) {
            const childHeight = child.height ?? DEFAULT_IMAGE_HEIGHT;
            childY = contentY + contentHeight - childHeight - child.bottom;
        }

        // Render child at calculated position
        const result = await renderNode(child, ctx, childX, childY, childWidth);
        objects.push(...result.objects);
    }

    return {
        width: containerWidth,
        height: containerHeight,
        objects,
    };
}

/**
 * Render a single node (dispatch to appropriate handler)
 */
async function renderNode(
    node: LayoutNode,
    ctx: LayoutContext,
    x: number,
    y: number,
    availableWidth: number
): Promise<LayoutResult> {
    // Apply width constraints
    let effectiveWidth = availableWidth;

    // Fixed width takes priority
    if (typeof node.width === 'number') {
        effectiveWidth = node.width;
    } else if (node.width !== 'auto') {
        // Apply min/max constraints
        if (node.minWidth !== undefined) {
            effectiveWidth = Math.max(effectiveWidth, node.minWidth);
        }
        if (node.maxWidth !== undefined) {
            effectiveWidth = Math.min(effectiveWidth, node.maxWidth);
        }
    }

    // Handle spacer (empty space)
    if (node.type === "spacer" || node.layout === "spacer") {
        return { width: effectiveWidth, height: node.height ?? DEFAULT_SPACER_HEIGHT, objects: [] };
    }

    // Helper to apply node-level properties (zIndex, rotation) to all objects
    const applyNodeProps = (result: LayoutResult): LayoutResult => {
        for (const obj of result.objects) {
            // Apply zIndex if specified
            if (node.zIndex !== undefined) {
                (obj as any).zIndex = node.zIndex;
            }
            // Apply rotation if specified (in degrees)
            if (node.rotation !== undefined) {
                obj.set({ angle: node.rotation });
            }
        }
        return result;
    };

    // Handle layout containers
    if (node.layout === "stack" || (node.children && !node.layout)) {
        return applyNodeProps(await renderStack({ ...node, layout: "stack" }, ctx, x, y, effectiveWidth));
    }

    if (node.layout === "columns") {
        return applyNodeProps(await renderColumns(node, ctx, x, y, effectiveWidth));
    }

    if (node.layout === "row") {
        return applyNodeProps(await renderRow(node, ctx, x, y, effectiveWidth));
    }

    if (node.layout === "grid") {
        return applyNodeProps(await renderGrid(node, ctx, x, y, effectiveWidth));
    }

    if (node.layout === "centered") {
        return applyNodeProps(await renderCentered(node, ctx, x, y, effectiveWidth));
    }

    if (node.layout === "absolute") {
        return applyNodeProps(await renderAbsolute(node, ctx, x, y, effectiveWidth));
    }

    // Handle absolute positioning (V2 legacy)
    if (node.position) {
        const pos = node.position;
        let absX = typeof pos.x === "number" ? pos.x : x;
        const absY = typeof pos.y === "number" ? pos.y + ctx.pageOffsetY : y;
        const width = pos.width ?? effectiveWidth;

        // Handle center alignment
        if (pos.x === "center") {
            absX = (ctx.canvasWidth - width) / 2;
        }

        const obj = await createElement(node, ctx, absX, absY, width);
        if (obj) {
            if (node.zIndex !== undefined) {
                (obj as any).zIndex = node.zIndex;
            }
            return {
                width: width,
                height: (obj.height ?? 0) * (obj.scaleY ?? 1),
                objects: [obj],
            };
        }
        return { width: 0, height: 0, objects: [] };
    }

    // Handle leaf elements (no position, no layout)
    const obj = await createElement(node, ctx, x, y, effectiveWidth);
    if (obj) {
        if (node.zIndex !== undefined) {
            (obj as any).zIndex = node.zIndex;
        }
        return {
            width: effectiveWidth,
            height: (obj.height ?? 0) * (obj.scaleY ?? 1),
            objects: [obj],
        };
    }

    return { width: 0, height: 0, objects: [] };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Render a V3 template page with auto-layout
 */
export async function renderLayoutPage(
    canvas: Canvas,
    page: LayoutNode,
    ctx: Omit<LayoutContext, "canvas">
): Promise<LayoutResult> {
    const fullCtx: LayoutContext = { ...ctx, canvas };
    const objects: FabricObject[] = [];

    console.log(`[LayoutEngine] Rendering page with layout: ${page.layout || "stack"}`);

    // Create background rect if specified
    if (page.background) {
        const bgColor = resolveToken(page.background, ctx.tokens);
        const bgRect = new Rect({
            left: 0,
            top: ctx.pageOffsetY,
            width: ctx.canvasWidth,
            height: ctx.canvasHeight,
            fill: bgColor,
            selectable: false,
            evented: false,
            hoverCursor: 'default',
        });
        (bgRect as any).isPageBackground = true;
        (bgRect as any).pageId = ctx.pageId;
        objects.push(bgRect);
    }

    const result = await renderNode(page, fullCtx, 0, ctx.pageOffsetY, ctx.canvasWidth);

    // Combine background with content objects
    objects.push(...result.objects);

    // Sort objects by zIndex before adding (stable sort preserves original order for equal zIndex)
    const sortedObjects = [...objects].sort((a, b) => {
        const zIndexA = (a as any).zIndex ?? 0;
        const zIndexB = (b as any).zIndex ?? 0;
        return zIndexA - zIndexB;
    });

    // Add all objects to canvas in sorted order
    for (const obj of sortedObjects) {
        canvas.add(obj);
    }

    console.log(`[LayoutEngine] Rendered ${objects.length} objects, height: ${result.height}px`);

    return { ...result, objects: sortedObjects };
}

/**
 * Check if a template uses V3 layout format
 */
export function isV3Template(template: any): boolean {
    return template.version === "3.0" ||
        template.pages?.some((p: any) => p.layout || p.children);
}
