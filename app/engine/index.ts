// Engine Exports - V3 Only
// All templates use V3 auto-layout format

import { Canvas } from "fabric";
import { renderLayoutPage } from "./LayoutEngine";
import { preloadTemplateFonts } from "./FontLoader";

// Page dimensions (A4 at 72 DPI)
export const PAGE_WIDTH = 595;
export const PAGE_HEIGHT = 842;
export const PAGE_GAP = 60;

// Layout Engine
export { renderLayoutPage, isV3Template } from "./LayoutEngine";
export type { LayoutNode, LayoutContext, LayoutResult } from "./LayoutEngine";

// Font System
export { preloadTemplateFonts, CURATED_FONTS, getFontsByCategory } from "./FontLoader";
export type { FontDefinition } from "./FontLoader";

// Token System
export { resolveTokensDeep } from "./TokenResolver";

/**
 * Load a template JSON file from the public folder
 */
export async function loadTemplate(jsonPath: string): Promise<any> {
    const response = await fetch(jsonPath);
    if (!response.ok) {
        throw new Error(`Failed to load template: ${jsonPath}`);
    }
    return response.json();
}

/**
 * Render a V3 template to a Fabric canvas
 */
export async function renderTemplate(
    canvas: Canvas,
    template: any,
    layoutMode: "horizontal" | "vertical" = "horizontal"
): Promise<void> {
    const pages = template.pages || [];

    if (pages.length === 0) {
        console.warn("[renderTemplate] No pages in template");
        return;
    }

    // Preload all fonts before rendering
    await preloadTemplateFonts(template);

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Calculate page offset based on layout mode
        const isHorizontal = layoutMode === "horizontal";
        const pageOffsetX = isHorizontal ? i * (PAGE_WIDTH + PAGE_GAP) : 0;
        const pageOffsetY = isHorizontal ? 0 : i * (PAGE_HEIGHT + PAGE_GAP);

        // Create layout context
        const ctx = {
            tokens: template.tokens || {},
            components: template.components || {},
            canvasWidth: PAGE_WIDTH,
            canvasHeight: PAGE_HEIGHT,
            pageOffsetY: pageOffsetY,
            pageId: page.id || `page-${i + 1}`,
        };

        // Adjust page x position for horizontal layout
        if (isHorizontal && pageOffsetX > 0) {
            // Render with offset - renderLayoutPage handles Y offset, we need to handle X
            const result = await renderLayoutPage(canvas, page, ctx);

            // Shift all objects by X offset for horizontal layout
            for (const obj of result.objects) {
                if (obj && typeof obj.left === "number") {
                    obj.set({ left: obj.left + pageOffsetX });
                }
            }
        } else {
            await renderLayoutPage(canvas, page, ctx);
        }
    }

    canvas.requestRenderAll();
    console.log(`[renderTemplate] Rendered ${pages.length} pages in ${layoutMode} mode`);
}
