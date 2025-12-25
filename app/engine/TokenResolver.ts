// Token Resolver - Resolves $token.path references to actual values

// Inline type definition (simplified from deleted TemplateV2Schema)
interface StyleTokens {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    [key: string]: any;
}

/**
 * Resolve a token reference like "$colors.primary" to its actual value
 */
export function resolveToken(value: any, tokens: StyleTokens): any {
    if (typeof value !== "string") return value;
    if (!value.startsWith("$")) return value;

    // Parse token path: $colors.primary -> ["colors", "primary"]
    const path = value.slice(1).split(".");

    let result: any = tokens;
    for (const key of path) {
        if (result && typeof result === "object" && key in result) {
            result = result[key];
        } else {
            console.warn(`Token not found: ${value}`);
            return value; // Return original if not found
        }
    }

    return result;
}

/**
 * Deep resolve all token references in an object
 */
export function resolveTokensDeep(obj: any, tokens: StyleTokens): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
        return resolveToken(obj, tokens);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => resolveTokensDeep(item, tokens));
    }

    if (typeof obj === "object") {
        const resolved: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
            resolved[key] = resolveTokensDeep(value, tokens);
        }
        return resolved;
    }

    return obj;
}

/**
 * Merge prop refs ($name) with provided props
 * Example: { content: "$name" } + { name: "Pasta" } -> { content: "Pasta" }
 */
export function resolvePropRefs(template: Record<string, any>, props: Record<string, any>): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(template)) {
        if (typeof value === "string" && value.startsWith("$")) {
            const propName = value.slice(1);
            resolved[key] = props[propName] ?? value;
        } else if (typeof value === "object" && value !== null) {
            resolved[key] = resolvePropRefs(value, props);
        } else {
            resolved[key] = value;
        }
    }

    return resolved;
}
