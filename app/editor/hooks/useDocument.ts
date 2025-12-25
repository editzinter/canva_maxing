"use client";

import { useState, useCallback } from "react";

export interface Page {
    id: string;
    content?: any;
    backgroundColor: string;
    layout: string;
    orientation?: "portrait" | "landscape";
}

export function useDocument(initialPages: Page[]) {
    const [pages, setPages] = useState<Page[]>(initialPages);
    const [activePageId, setActivePageId] = useState<string>(initialPages[0]?.id || "");

    const addPage = useCallback(() => {
        const newPageId = `page_${Date.now()}`;
        const newPage: Page = {
            id: newPageId,
            backgroundColor: "#000000",
            layout: "classic"
        };
        setPages(prev => [...prev, newPage]);
        setActivePageId(newPageId);
        return newPage;
    }, []);

    const deletePage = useCallback((id: string) => {
        setPages(prev => {
            if (prev.length <= 1) return prev;
            const newPages = prev.filter(p => p.id !== id);
            
            if (activePageId === id) {
                setActivePageId(newPages[0]?.id || "");
            }
            
            return newPages;
        });
    }, [activePageId]);

    const updatePage = useCallback((id: string, updates: Partial<Page>) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    return {
        pages,
        activePageId,
        setActivePageId,
        addPage,
        deletePage,
        updatePage,
        activePage: pages.find(p => p.id === activePageId)
    };
}
