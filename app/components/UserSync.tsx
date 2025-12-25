"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserSync() {
    const { user } = useAuth();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const storeUser = useMutation(api.users.store);

    const currentUser = useQuery(api.users.current);

    // Track if we've already synced this session to prevent duplicate calls
    const syncInProgressRef = useRef(false);

    useEffect(() => {
        // Wait for Convex to be ready
        if (isLoading || !isAuthenticated || !user) return;

        // If user is already stored in Convex, we don't need to do anything
        if (currentUser !== null) {
            return;
        }

        // Check if sync is already in progress to avoid double-firing
        if (syncInProgressRef.current) return;

        const syncUser = async () => {
            syncInProgressRef.current = true;
            console.log("[UserSync] User missing in Convex. Syncing now...");

            try {
                const id = await storeUser({});
                console.log("[UserSync] Success, user ID:", id);
                // We don't need to manually set "hasSynced" because currentUser will become non-null
                // triggering a re-render where this effect won't run.
            } catch (err) {
                console.error("[UserSync] Mutation failed:", err);
            } finally {
                syncInProgressRef.current = false;
            }
        };

        syncUser();
    }, [isAuthenticated, isLoading, user, currentUser, storeUser]);

    return null;
}
