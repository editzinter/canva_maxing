import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const syncFromWebhook = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        picture: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();

        if (user !== null) {
            await ctx.db.patch(user._id, {
                name: args.name || "User",
                email: args.email || "",
                picture: args.picture || "",
            });
            return user._id;
        } else {
            const newUserId = await ctx.db.insert("users", {
                tokenIdentifier: args.tokenIdentifier,
                name: args.name || "User",
                email: args.email || "",
                picture: args.picture || "",
            });
            return newUserId;
        }
    },
});

export const deleteFromWebhook = internalMutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();

        if (user !== null) {
            await ctx.db.delete(user._id);
        }
    },
});

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if user exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (user !== null) {
            // Update existing user
            // We update name/email/picture in case they changed in WorkOS
            // The identity object usually maps 'name', 'email' etc. from OIDC claims.
            // Adjust property access if Convex identity object differs 
            // (Convex Identity: subject, issuer, name, email, pictureUrl, etc.)

            await ctx.db.patch(user._id, {
                name: identity.name || "User",
                email: identity.email || "",
                picture: identity.pictureUrl || "",
            });
            return user._id;
        } else {
            // Create new user
            const newUserId = await ctx.db.insert("users", {
                tokenIdentifier: identity.tokenIdentifier,
                name: identity.name || "User",
                email: identity.email || "",
                picture: identity.pictureUrl || "",
            });
            return newUserId;
        }
    },
});

export const current = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();
        return user;
    },
});
