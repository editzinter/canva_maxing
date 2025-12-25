import { TemplateConfig, TemplateManifest } from "./types";

/**
 * TEMPLATE MANIFEST
 * Single source of truth for all template configurations.
 * 
 * To add a new template:
 * 1. Create renderer functions in app/renderers/[name]Layouts.ts
 * 2. Create data in app/data/templateData.ts
 * 3. Add an entry here
 * 
 * That's it! No need to touch page.tsx or any other files.
 */
export const TEMPLATES: TemplateManifest = {
    // =========================================================================
    // DARK MODERN (4 Pages) - JSON FORMAT
    // =========================================================================
    "dark-modern": {
        id: "dark-modern",
        name: "Dark Modern",
        thumbnail: "/assets/templates/dark-modern.png",
        category: "Restaurant",
        format: "json",
        jsonPath: "/templates/json/dark-modern.json",
        orientation: "portrait",
        backgroundColor: "#121212"
    },

    // =========================================================================
    // COTTON CANDY (3 Pages) - JSON FORMAT
    // =========================================================================
    "cotton-candy": {
        id: "cotton-candy",
        name: "Cotton Candy",
        thumbnail: "/assets/templates/cotton-candy.png",
        category: "Dessert Cafe",
        format: "json",
        jsonPath: "/templates/json/cotton-candy.json",
        orientation: "portrait",
        backgroundColor: "#ffeaf2"
    },

    // =========================================================================
    // DAILY GRIND (5 Pages, Landscape) - JSON FORMAT
    // =========================================================================
    "daily-grind": {
        id: "daily-grind",
        name: "Daily Grind",
        thumbnail: "/assets/templates/daily-grind.png",
        category: "Cafe & Bowls",
        format: "json",
        jsonPath: "/templates/json/daily-grind.json",
        orientation: "landscape",
        backgroundColor: "#18181b"
    },

    // =========================================================================
    // SLATE GRILL (3 Pages) - JSON FORMAT
    // =========================================================================
    "slate-grill": {
        id: "slate-grill",
        name: "Slate Grill",
        thumbnail: "/assets/templates/slate-grill.png",
        category: "Gastropub",
        format: "json",
        jsonPath: "/templates/json/slate-grill.json",
        orientation: "portrait",
        backgroundColor: "#1a1a1a"
    },

    // =========================================================================
    // ZEN SUSHI (5 Pages) - JSON FORMAT
    // =========================================================================
    "zen-sushi": {
        id: "zen-sushi",
        name: "Zen Sushi",
        thumbnail: "/assets/templates/zen-sushi.png",
        category: "Japanese",
        format: "json",
        jsonPath: "/templates/json/zen-sushi.json",
        orientation: "portrait",
        backgroundColor: "#f4f1ea"
    },

    // =========================================================================
    // MIDNIGHT BISTRO (4 Pages) - JSON FORMAT
    // =========================================================================
    "midnight-bistro": {
        id: "midnight-bistro",
        name: "Midnight Bistro",
        thumbnail: "/assets/templates/midnight-bistro.png",
        category: "Fine Dining",
        format: "json",
        jsonPath: "/templates/json/midnight-bistro.json",
        orientation: "portrait",
        backgroundColor: "#1a1a1a"
    },

    // =========================================================================
    // CHALKBOARD CAFE (4 Pages) - JSON FORMAT
    // =========================================================================
    "chalkboard-cafe": {
        id: "chalkboard-cafe",
        name: "Chalkboard Cafe",
        thumbnail: "/assets/templates/chalkboard-cafe.png",
        category: "Coffee Shop",
        format: "json",
        jsonPath: "/templates/json/chalkboard-cafe.json",
        orientation: "portrait",
        backgroundColor: "#1e1e1e"
    },

    // =========================================================================
    // BURGER JOINT (1 Page) - JSON FORMAT
    // =========================================================================
    "burger-joint": {
        id: "burger-joint",
        name: "Burger Joint",
        thumbnail: "/assets/templates/modern-plate.png", // Placeholder until generation works
        category: "Restaurant",
        format: "json",
        jsonPath: "/templates/json/burger-joint.json",
        orientation: "portrait",
        backgroundColor: "#f4f1ea"
    },

    // =========================================================================
    // TASTE EATERY V2 (Component Refs + Style Tokens)
    // =========================================================================
    "taste-eatery": {
        id: "taste-eatery",
        name: "Taste Modern Eatery",
        thumbnail: "/assets/templates/taste-eatery.png",
        category: "Modern Restaurant",
        format: "json",
        jsonPath: "/templates/json/taste-eatery.json",
        orientation: "portrait",
        backgroundColor: "#f4f1ea"
    },


    // =========================================================================
    // THE MODERN PLATE (4 Pages) - JSON FORMAT
    // =========================================================================
    "modern-plate": {
        id: "modern-plate",
        name: "The Modern Plate",
        thumbnail: "/assets/templates/modern-plate.png",
        category: "Fine Dining",
        format: "json",
        jsonPath: "/templates/json/modern-plate.json",
        orientation: "portrait",
        backgroundColor: "#f4f1ea"
    },

    // =========================================================================
    // BLANK CANVAS - JSON FORMAT
    // =========================================================================
    "blank": {
        id: "blank",
        name: "Start from Scratch",
        category: "General",
        thumbnail: "",
        format: "json",
        jsonPath: "/templates/json/blank.json",
        orientation: "portrait",
        backgroundColor: "#ffffff"
    },

    // =========================================================================
    // AUTO-LAYOUT TEST (V3 Format) - For testing stack/columns layout
    // =========================================================================
    "auto-layout-test": {
        id: "auto-layout-test",
        name: "Auto-Layout Test",
        thumbnail: "/assets/templates/modern-plate.png",
        category: "Test",
        format: "json",
        jsonPath: "/templates/json/auto-layout-test.json",
        orientation: "portrait",
        backgroundColor: "#f4f1ea"
    },

    // =========================================================================
    // URBAN FLAVORS (Bold Geometric Design) - JSON FORMAT
    // =========================================================================
    "urban-flavors": {
        id: "urban-flavors",
        name: "Urban Flavors",
        thumbnail: "/assets/templates/modern-plate.png", // Placeholder until generated
        category: "Street Food",
        format: "json",
        jsonPath: "/templates/json/urban-flavors.json",
        orientation: "portrait",
        backgroundColor: "#fdfbf7"
    }
};

/**
 * Get a template by ID with fallback to default
 */
export const getTemplate = (id: string): TemplateConfig | null => {
    return TEMPLATES[id] || null;
};

/**
 * Get all template IDs
 */
export const getTemplateIds = (): string[] => {
    return Object.keys(TEMPLATES);
};

/**
 * Default template ID (used as fallback)
 */
export const DEFAULT_TEMPLATE_ID = "midnight-bistro";
