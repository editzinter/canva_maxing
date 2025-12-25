import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        tokenIdentifier: v.string(), // WorkOS User ID
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        picture: v.optional(v.string()),
    }).index("by_token", ["tokenIdentifier"]),

    projects: defineTable({
        userId: v.string(), // Changed to string to store User Identity (tokenIdentifier or similar) easily
        name: v.string(),
        templateId: v.string(), // "blank" or specific template ID
        category: v.optional(v.string()), // For filtering
        width: v.optional(v.number()), // For custom canvas size
        height: v.optional(v.number()),
        content: v.optional(v.string()), // JSON stringified content (Legacy/Small)
        storageId: v.optional(v.id("_storage")), // Large content (>1MB)
        preview: v.optional(v.string()), // Thumbnail URL or base64
        lastModified: v.number(),
    }).index("by_user", ["userId"]),
});
