"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ProjectCardProps {
    project: {
        _id: Id<"projects">;
        name: string;
        category?: string;
        lastModified: number;
        preview?: string;
    };
    index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(project.name);
    const [isDeleting, setIsDeleting] = useState(false);

    const renameProject = useMutation(api.projects.rename);
    const removeProject = useMutation(api.projects.remove);

    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when renaming starts
    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isRenaming]);

    const handleRename = async () => {
        if (!newName.trim() || newName === project.name) {
            setIsRenaming(false);
            return;
        }
        try {
            await renameProject({ id: project._id, name: newName });
            setIsRenaming(false);
        } catch (error) {
            console.error("Failed to rename project:", error);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
            setIsDeleting(true);
            try {
                await removeProject({ id: project._id });
            } catch (error) {
                console.error("Failed to delete project:", error);
                setIsDeleting(false);
            }
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative aspect-[3/4] md:aspect-[4/5] bg-card/40 backdrop-blur-sm border border-border hover:border-lime-400/50 rounded-xl overflow-visible cursor-pointer transition-all duration-500 hover:shadow-[0_0_30px_rgba(163,230,53,0.1)] flex flex-col justify-between p-6"
        >
            {/* Abstract Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none bg-grid-pattern rounded-xl"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent, black)',
                    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                    color: 'var(--foreground)'
                }}
            />

            {/* Top: Metadata & Action Bar */}
            <div className="relative z-10 font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex justify-between items-center border-b border-border/40 pb-4 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors duration-300">
                <span>{new Date(project.lastModified).toLocaleDateString()}</span>

                {/* Hover Action Bar */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsRenaming(true);
                        }}
                        className="p-2 bg-card/80 hover:bg-lime-400 hover:text-black rounded-full border border-border hover:border-lime-400 transition-all shadow-sm"
                        title="Rename Project"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete();
                        }}
                        className="p-2 bg-card/80 hover:bg-red-500 hover:text-white rounded-full border border-border hover:border-red-500 transition-all shadow-sm"
                        title="Delete Project"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Middle: Title or Edit Input */}
            <div className={`relative z-10 flex-grow flex flex-col justify-center py-4 ${isDeleting ? 'opacity-50' : ''}`}>
                {isRenaming ? (
                    <div className="flex flex-col gap-2" onClick={(e) => e.preventDefault()}>
                        <input
                            ref={inputRef}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-muted/50 border border-lime-400 rounded px-2 py-1 text-2xl font-bebas text-foreground w-full focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename();
                                if (e.key === 'Escape') setIsRenaming(false);
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleRename}
                                className="flex-1 bg-lime-400 text-black text-xs font-bold py-1 rounded hover:bg-lime-300"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsRenaming(false)}
                                className="flex-1 bg-muted text-foreground text-xs font-bold py-1 rounded hover:bg-muted/80"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link href={`/editor/${project._id}`} className="block w-full h-full">
                        <h3 className="font-bebas text-5xl md:text-6xl text-foreground leading-[0.85] break-words group-hover:text-black dark:group-hover:text-white transition-colors duration-300 line-clamp-3">
                            {project.name}
                        </h3>
                        <div className="w-12 h-1 bg-lime-500 dark:bg-lime-400 mt-6 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </Link>
                )}
            </div>

            {/* Bottom: Category */}
            <Link href={`/editor/${project._id}`} className="relative z-10 flex justify-between items-end border-t border-border/40 pt-4 block w-full">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Category</span>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors duration-300">{project.category || "Menu"}</span>
                </div>

                {/* Arrow Icon */}
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-lime-500 dark:group-hover:bg-lime-400 group-hover:border-lime-500 dark:group-hover:border-lime-400 group-hover:text-white dark:group-hover:text-black transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-45 group-hover:rotate-0 transition-transform duration-300">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>
            </Link>
        </motion.div>
    );
}
