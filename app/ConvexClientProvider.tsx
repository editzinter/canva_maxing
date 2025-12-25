"use client";
import { ReactNode, useCallback, useMemo } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-nextjs/components";
import { UserSync } from "./components/UserSync";
import { getAccessToken } from "./actions/auth";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ConvexProviderWithBridge({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    const isAuthenticated = !!user;

    const fetchAccessToken = useCallback(async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
        try {
            // Call Server Action to mint Convex-compatible JWT
            const token = await getAccessToken();
            return token;
        } catch (error) {
            console.error("Failed to mint access token:", error);
            return null;
        }
    }, []);

    return (
        <ConvexProviderWithAuth client={convex} useAuth={() => ({
            isLoading: loading,
            isAuthenticated,
            fetchAccessToken,
        })}>
            <UserSync />
            {children}
        </ConvexProviderWithAuth>
    );
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexProviderWithBridge>{children}</ConvexProviderWithBridge>
    );
}
