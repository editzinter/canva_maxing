"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, Trash2 } from "lucide-react";

interface UnsavedChangesModalProps {
    isOpen: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export function UnsavedChangesModal({
    isOpen,
    onSave,
    onDiscard,
    onCancel,
    isSaving = false,
}: UnsavedChangesModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
                    >
                        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="px-6 pt-6 pb-4">
                                <h2 className="text-xl font-bebas tracking-wide text-foreground">
                                    Unsaved Changes
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    You have unsaved changes. Would you like to save before leaving?
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-6 flex flex-col gap-3">
                                <button
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-lime-400 text-black font-semibold rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                    onClick={onDiscard}
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 text-red-500 font-semibold rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Discard Changes
                                </button>

                                <button
                                    onClick={onCancel}
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
