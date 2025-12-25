"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, FileType } from "lucide-react";
import { useMutation, useConvexAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

type PageSize = {
    name: string;
    width: number;
    height: number;
};

const PAGE_SIZES: PageSize[] = [
    { name: "A4 (Vertical)", width: 595, height: 842 },
    { name: "A5 (Vertical)", width: 420, height: 595 },
    { name: "Letter (Vertical)", width: 612, height: 792 },
    { name: "Square (IG Post)", width: 1080, height: 1080 },
    { name: "HD Landscape", width: 1920, height: 1080 },
];

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    templateName?: string;
}

export function NewProjectModal({ isOpen, onClose, templateId, templateName }: NewProjectModalProps) {
    const router = useRouter();
    const createProject = useMutation(api.projects.create);
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { user } = useAuth();

    const [name, setName] = useState(templateName ? `${templateName} Remix` : "My New Menu");
    const [selectedSize, setSelectedSize] = useState<PageSize>(PAGE_SIZES[0]);
    const [isCreating, setIsCreating] = useState(false);

    const isBlank = templateId === "blank";

    const handleCreate = async () => {
        if (!name.trim()) return;
        setIsCreating(true);

        try {
            const projectId = await createProject({
                name,
                templateId,
                width: isBlank ? selectedSize.width : undefined,
                height: isBlank ? selectedSize.height : undefined,
                category: isBlank ? "Custom" : "Menu",
            });

            // Redirect to editor with the new Project ID
            router.push(`/editor/${projectId}`);
        } catch (error) {
            console.error("Failed to create project:", error);
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-muted/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="font-bebas text-3xl tracking-wide">
                                    {isBlank ? "START FROM SCRATCH" : "CREATE PROJECT"}
                                </h2>
                                <p className="text-muted-foreground text-sm font-manrope">
                                    {isBlank
                                        ? "Configure your blank canvas settings."
                                        : `Instantiating from "${templateName}"`}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Project Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:border-lime-400 focus:outline-none transition-colors font-medium"
                                placeholder="Enter project name..."
                                autoFocus
                            />
                        </div>

                        {/* Size Selector (Only for Blank) */}
                        {isBlank && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Canvas Size
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PAGE_SIZES.map((size) => (
                                        <button
                                            key={size.name}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-3 py-2 rounded-lg border text-left text-sm transition-all flex items-center justify-between
                                                ${selectedSize.name === size.name
                                                    ? "border-lime-400 bg-lime-400/10 text-lime-500"
                                                    : "border-border hover:border-foreground/30 text-muted-foreground"
                                                }
                                            `}
                                        >
                                            <span className="font-medium">{size.name}</span>
                                            {selectedSize.name === size.name && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg font-bold text-sm hover:bg-muted transition-colors"
                        >
                            CANCEL
                        </button>

                        {isAuthenticated ? (
                            <button
                                onClick={handleCreate}
                                disabled={!name.trim() || isCreating || isLoading}
                                className="bg-lime-400 text-black px-8 py-2 rounded-lg font-bebas text-xl tracking-wide hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                            >
                                {isCreating ? "CREATING..." : "CREATE PROJECT"}
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.href = "/api/auth/login"}
                                disabled={isLoading}
                                className="bg-foreground text-background px-8 py-2 rounded-lg font-bebas text-xl tracking-wide hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? "CHECKING..." : (user ? "RE-LOGIN TO SYNC" : "LOG IN TO CREATE")}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
