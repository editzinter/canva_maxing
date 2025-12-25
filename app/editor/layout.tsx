"use client";

import React from "react";
import { CanvasProvider } from "./context/CanvasContext";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    return (
        <CanvasProvider>
            {children}
        </CanvasProvider>
    );
}
