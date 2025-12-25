/**
 * FontLoader.ts - Font preloading system for template rendering
 * 
 * Ensures fonts are loaded before Fabric.js renders text elements.
 * Uses the CSS Font Loading API with Google Fonts fallback.
 */

// ============================================================================
// CURATED FONT LIST (for AI to use in templates)
// ============================================================================

export interface FontDefinition {
    name: string;           // Display name
    family: string;         // CSS font-family name
    category: 'serif' | 'sans' | 'display' | 'script' | 'mono';
    weights: number[];      // Available weights
    styles?: ('normal' | 'italic')[];
    description: string;    // For AI to understand usage
}

/**
 * Curated fonts - validated to work with Fabric.js and Google Fonts
 * AI should use these fonts in templates for guaranteed rendering
 */
export const CURATED_FONTS: FontDefinition[] = [
    // === SERIF (Elegant, Traditional) ===
    { name: "Playfair Display", family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 800, 900], description: "Elegant serif for luxury headlines" },
    { name: "Merriweather", family: "Merriweather", category: "serif", weights: [300, 400, 700, 900], description: "Readable serif for body text" },
    { name: "Lora", family: "Lora", category: "serif", weights: [400, 500, 600, 700], description: "Contemporary serif with calligraphic roots" },
    { name: "Libre Baskerville", family: "Libre Baskerville", category: "serif", weights: [400, 700], description: "Classic serif for editorial" },
    { name: "Cormorant Garamond", family: "Cormorant Garamond", category: "serif", weights: [300, 400, 500, 600, 700], description: "Light elegant serif" },
    { name: "DM Serif Display", family: "DM Serif Display", category: "serif", weights: [400], description: "Bold display serif" },
    { name: "Bodoni Moda", family: "Bodoni Moda", category: "serif", weights: [400, 500, 600, 700, 800, 900], description: "Fashion magazine serif" },
    { name: "Prata", family: "Prata", category: "serif", weights: [400], description: "Didone style serif" },

    // === SANS-SERIF (Modern, Clean) ===
    { name: "Inter", family: "Inter", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], description: "Universal sans-serif for UI and text" },
    { name: "Roboto", family: "Roboto", category: "sans", weights: [100, 300, 400, 500, 700, 900], description: "Google's clean sans-serif" },
    { name: "Open Sans", family: "Open Sans", category: "sans", weights: [300, 400, 500, 600, 700, 800], description: "Friendly readable sans" },
    { name: "Montserrat", family: "Montserrat", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], description: "Geometric sans for headlines" },
    { name: "Poppins", family: "Poppins", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], description: "Geometric sans with personality" },
    { name: "Outfit", family: "Outfit", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], description: "Modern geometric sans" },
    { name: "DM Sans", family: "DM Sans", category: "sans", weights: [400, 500, 700], description: "Clean low-contrast sans" },
    { name: "Manrope", family: "Manrope", category: "sans", weights: [200, 300, 400, 500, 600, 700, 800], description: "Modern variable sans" },
    { name: "Space Grotesk", family: "Space Grotesk", category: "sans", weights: [300, 400, 500, 600, 700], description: "Techy sans-serif" },

    // === DISPLAY (Headlines, Titles) ===
    { name: "Bebas Neue", family: "Bebas Neue", category: "display", weights: [400], description: "Condensed uppercase display" },
    { name: "Anton", family: "Anton", category: "display", weights: [400], description: "Bold condensed display" },
    { name: "Oswald", family: "Oswald", category: "display", weights: [200, 300, 400, 500, 600, 700], description: "Condensed gothic style" },
    { name: "Archivo Black", family: "Archivo Black", category: "display", weights: [400], description: "Heavy grotesque display" },
    { name: "Syne", family: "Syne", category: "display", weights: [400, 500, 600, 700, 800], description: "Experimental display" },
    { name: "Italiana", family: "Italiana", category: "display", weights: [400], description: "Elegant fashion display" },
    { name: "Cinzel", family: "Cinzel", category: "display", weights: [400, 500, 600, 700, 800, 900], description: "Roman inscriptional display" },
    { name: "Julius Sans One", family: "Julius Sans One", category: "display", weights: [400], description: "Elegant thin display" },
    { name: "Marcellus", family: "Marcellus", category: "display", weights: [400], description: "Roman vintage display" },

    // === SCRIPT (Handwriting, Elegant) ===
    { name: "Dancing Script", family: "Dancing Script", category: "script", weights: [400, 500, 600, 700], description: "Casual script for friendly designs" },
    { name: "Great Vibes", family: "Great Vibes", category: "script", weights: [400], description: "Elegant formal script" },
    { name: "Pacifico", family: "Pacifico", category: "script", weights: [400], description: "Retro surf script" },
    { name: "Alex Brush", family: "Alex Brush", category: "script", weights: [400], description: "Elegant brush script" },
    { name: "Pinyon Script", family: "Pinyon Script", category: "script", weights: [400], description: "Formal calligraphy script" },

    // === MONOSPACE (Code, Technical) ===
    { name: "Fira Code", family: "Fira Code", category: "mono", weights: [300, 400, 500, 600, 700], description: "Developer favorite monospace" },
    { name: "JetBrains Mono", family: "JetBrains Mono", category: "mono", weights: [100, 200, 300, 400, 500, 600, 700, 800], description: "Modern coding font" },
    { name: "Space Mono", family: "Space Mono", category: "mono", weights: [400, 700], description: "Retro-futuristic mono" },
];

// Map of font name to Google Fonts URL parameter name
const GOOGLE_FONTS_MAP: Record<string, string> = {
    "Playfair Display": "Playfair+Display",
    "Merriweather": "Merriweather",
    "Lora": "Lora",
    "Libre Baskerville": "Libre+Baskerville",
    "Cormorant Garamond": "Cormorant+Garamond",
    "DM Serif Display": "DM+Serif+Display",
    "Bodoni Moda": "Bodoni+Moda",
    "Prata": "Prata",
    "Inter": "Inter",
    "Roboto": "Roboto",
    "Open Sans": "Open+Sans",
    "Montserrat": "Montserrat",
    "Poppins": "Poppins",
    "Outfit": "Outfit",
    "DM Sans": "DM+Sans",
    "Manrope": "Manrope",
    "Space Grotesk": "Space+Grotesk",
    "Bebas Neue": "Bebas+Neue",
    "Anton": "Anton",
    "Oswald": "Oswald",
    "Archivo Black": "Archivo+Black",
    "Syne": "Syne",
    "Italiana": "Italiana",
    "Cinzel": "Cinzel",
    "Julius Sans One": "Julius+Sans+One",
    "Marcellus": "Marcellus",
    "Dancing Script": "Dancing+Script",
    "Great Vibes": "Great+Vibes",
    "Pacifico": "Pacifico",
    "Alex Brush": "Alex+Brush",
    "Pinyon Script": "Pinyon+Script",
    "Fira Code": "Fira+Code",
    "JetBrains Mono": "JetBrains+Mono",
    "Space Mono": "Space+Mono",
};

// Track loaded fonts
const loadedFonts = new Set<string>();

/**
 * Load a single font from Google Fonts
 */
async function loadGoogleFont(fontFamily: string, weights: number[] = [400, 700]): Promise<void> {
    // Skip if already loaded
    if (loadedFonts.has(fontFamily)) return;

    const googleName = GOOGLE_FONTS_MAP[fontFamily];
    if (!googleName) {
        console.warn(`[FontLoader] Unknown font: ${fontFamily}, attempting direct load`);
        return loadGenericFont(fontFamily, weights);
    }

    const weightsStr = weights.join(';');
    const url = `https://fonts.googleapis.com/css2?family=${googleName}:wght@${weightsStr}&display=swap`;

    // Create and inject link element
    if (typeof document !== 'undefined') {
        const existingLink = document.querySelector(`link[href="${url}"]`);
        if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
        }

        // Wait for font to be ready using CSS Font Loading API
        try {
            await document.fonts.load(`400 16px "${fontFamily}"`);
            loadedFonts.add(fontFamily);
        } catch (e) {
            console.warn(`[FontLoader] Failed to verify font load: ${fontFamily}`, e);
        }
    }
}

/**
 * Load a generic font (fallback for unknown fonts)
 */
async function loadGenericFont(fontFamily: string, weights: number[] = [400, 700]): Promise<void> {
    const weightsStr = weights.join(';');
    const googleName = fontFamily.replace(/ /g, '+');
    const url = `https://fonts.googleapis.com/css2?family=${googleName}:wght@${weightsStr}&display=swap`;

    if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);

        try {
            await document.fonts.load(`400 16px "${fontFamily}"`);
            loadedFonts.add(fontFamily);
        } catch (e) {
            // Font may not exist on Google Fonts
            console.warn(`[FontLoader] Font may not exist: ${fontFamily}`);
        }
    }
}

/**
 * Extract all fonts from a template's tokens
 */
export function extractFontsFromTemplate(template: any): string[] {
    const fonts: Set<string> = new Set();

    // Get fonts from tokens
    if (template.tokens?.fonts) {
        Object.values(template.tokens.fonts).forEach((font: any) => {
            if (typeof font === 'string') {
                fonts.add(font);
            }
        });
    }

    // Recursively find direct fontFamily usage in the template
    const findFonts = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;

        if (obj.fontFamily && typeof obj.fontFamily === 'string' && !obj.fontFamily.startsWith('$')) {
            fonts.add(obj.fontFamily);
        }

        if (Array.isArray(obj)) {
            obj.forEach(findFonts);
        } else {
            Object.values(obj).forEach(findFonts);
        }
    };

    findFonts(template);

    return Array.from(fonts);
}

/**
 * Preload all fonts required by a template
 * Call this BEFORE rendering with LayoutEngine
 */
export async function preloadTemplateFonts(template: any): Promise<void> {
    const fonts = extractFontsFromTemplate(template);

    console.log(`[FontLoader] Preloading ${fonts.length} fonts:`, fonts);

    await Promise.all(fonts.map(font => {
        const definition = CURATED_FONTS.find(f => f.family === font);
        const weights = definition?.weights || [400, 700];
        return loadGoogleFont(font, weights);
    }));

    console.log(`[FontLoader] All fonts loaded`);
}

/**
 * Check if a font is ready
 */
export function isFontLoaded(fontFamily: string): boolean {
    return loadedFonts.has(fontFamily);
}

/**
 * Get fonts by category (for AI to use)
 */
export function getFontsByCategory(category: FontDefinition['category']): FontDefinition[] {
    return CURATED_FONTS.filter(f => f.category === category);
}

/**
 * Get a random font from a category (for AI variation)
 */
export function getRandomFont(category?: FontDefinition['category']): FontDefinition {
    const fonts = category ? getFontsByCategory(category) : CURATED_FONTS;
    return fonts[Math.floor(Math.random() * fonts.length)];
}
