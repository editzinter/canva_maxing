import { Canvas } from "fabric";

/**
 * Configuration for a single page within a template (LEGACY)
 */
export interface TemplatePageConfig {
    /** Unique identifier for this page's layout */
    layoutId: string;
    /** The renderer function that draws this page on the canvas */
    renderer: (canvas: Canvas, data?: any, style?: any) => Promise<void> | void;
}

/**
 * Style configuration for a template
 * All properties are optional to accommodate different template styles
 */
export interface TemplateStyle {
    background?: string;
    color?: string;
    accent?: string;
    secondary?: string;
    font?: string;
    fontGeneric?: string;
    fontHeader?: string;
    headingColor?: string;
    textColor?: string;
    accentColor?: string;
}

/**
 * Complete configuration for a template
 */
export interface TemplateConfig {
    /** Unique identifier for the template (used in URL) */
    id: string;
    /** Display name for the template */
    name: string;
    /** Path to thumbnail image */
    thumbnail: string;
    /** Category for filtering */
    category: string;
    /** Template format: 'json' for new engine, 'legacy' for old renderers */
    format?: "json" | "legacy";
    /** Path to JSON template file (required when format is 'json') */
    jsonPath?: string;
    /** Array of page configurations (LEGACY - only when format is 'legacy') */
    pages?: TemplatePageConfig[];
    /** Template data (content, sections, etc.) - LEGACY */
    data?: any;
    /** Style configuration - LEGACY */
    style?: TemplateStyle;
    /** Page orientation */
    orientation: "portrait" | "landscape";
    /** Default background color */
    backgroundColor: string;
}

/**
 * Map of template IDs to their configurations
 */
export type TemplateManifest = Record<string, TemplateConfig>;

