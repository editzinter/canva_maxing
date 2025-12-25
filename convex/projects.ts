import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to get authenticated user
// Helper to get authenticated user
async function getUser(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthenticated");
    }
    return identity;
}

export const getPaginated = query({
    args: { paginationOpts: v.any() }, // paginationOpts is required by usePaginatedQuery
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { page: [], isDone: true, continueCursor: "" }; // Empty pagination result

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .paginate(args.paginationOpts);

        return projects;
    },
});

export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        return projects;
    },
});

export const getById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        // Validate if id is a proper Convex ID for projects table
        const normalizedId = ctx.db.normalizeId("projects", args.id);
        if (!normalizedId) {
            // Not a valid project ID (might be a template slug like "zen-sushi")
            return null;
        }

        const project = await ctx.db.get(normalizedId);
        if (!project) return null;

        // Security: Restrict access to project owner
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || project.userId !== identity.subject) return null;

        // If content is in storage, generate a URL
        let storageUrl = null;
        if (project.storageId) {
            storageUrl = await ctx.storage.getUrl(project.storageId);
        }

        return { ...project, storageUrl };
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
    args: {
        name: v.string(),
        templateId: v.string(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        category: v.optional(v.string()),
        content: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getUser(ctx);
        const userId = identity.subject;

        const projectId = await ctx.db.insert("projects", {
            userId,
            name: args.name,
            templateId: args.templateId,
            width: args.width,
            height: args.height,
            category: args.category || "Menu",
            content: args.content,
            lastModified: Date.now(),
        });

        return projectId;
    },
});

export const update = mutation({
    args: {
        id: v.id("projects"),
        content: v.optional(v.string()), // Optional now, since we might use storageId
        storageId: v.optional(v.id("_storage")),
        preview: v.optional(v.string()), // Fixed: match schema field name
    },
    handler: async (ctx, args) => {
        const identity = await getUser(ctx);
        const project = await ctx.db.get(args.id);

        if (!project || project.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        // If using storage, content might be null/empty in the args, 
        // OR we explicitly clear content field in DB if migrating to storage.
        const patchData: any = {
            preview: args.preview,
            lastModified: Date.now(),
        };

        if (args.storageId) {
            patchData.storageId = args.storageId;
            patchData.content = undefined; // Clear legacy content to save space
        } else if (args.content !== undefined) {
            patchData.content = args.content;
            // Should we clear storageId? Yes, if falling back to small storage
            patchData.storageId = undefined;
        }

        await ctx.db.patch(args.id, patchData);
    },
});

export const remove = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

// Rename a project
export const rename = mutation({
    args: {
        id: v.id("projects"),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await getUser(ctx);
        const project = await ctx.db.get(args.id);

        if (!project || project.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            name: args.name,
            lastModified: Date.now(),
        });
    },
});

// Duplicate a project
export const duplicate = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await getUser(ctx);
        const project = await ctx.db.get(args.id);

        if (!project || project.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        const newProjectId = await ctx.db.insert("projects", {
            userId: identity.subject,
            name: `${project.name} (Copy)`,
            templateId: project.templateId,
            width: project.width,
            height: project.height,
            category: project.category,
            content: project.content,
            preview: project.preview,
            lastModified: Date.now(),
        });

        return newProjectId;
    },
});

// Get most recent projects (for dashboard)
export const getRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(args.limit || 5);

        return projects;
    },
});
