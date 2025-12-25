"use client";

import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
    return <AuthKitProvider>{children}</AuthKitProvider>;
}
