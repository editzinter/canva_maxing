"use client";

import React from "react";
import { Layout, Type, Image as ImageIcon, Palette, ChefHat, PenTool, Settings, Shapes, Circle, Square, Minus } from "lucide-react";
import { motion } from "framer-motion";

const TOOLS = [
    { id: "text", icon: Type, label: "Text" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "shapes", icon: Square, label: "Shapes" },
    { id: "assets", icon: Shapes, label: "Assets" },
    { id: "background", icon: Palette, label: "Background" },
    { id: "ai", icon: ChefHat, label: "AI Chef" },
    { id: "design", icon: PenTool, label: "Design" },
];

interface EditorSidebarProps {
    activeTool: string;
    onSelectTool: (tool: string) => void;
}

export function EditorSidebar({ activeTool, onSelectTool }: EditorSidebarProps) {
    // const [activeTool, setActiveTool] = React.useState("layout"); // Removed local state

    return (
        <div className="fixed md:relative bottom-0 left-0 right-0 w-full md:w-24 h-[4rem] md:h-full bg-card border-t md:border-t-0 md:border-r border-border/10 flex flex-row md:flex-col items-center py-2 md:py-6 z-40 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] shrink-0 order-last md:order-first justify-between px-4 md:px-0">

            <div className="flex flex-row md:flex-col w-full gap-2 overflow-x-auto md:overflow-x-visible custom-scrollbar pb-2 md:pb-0">
                {TOOLS.map((tool) => {
                    const isActive = activeTool === tool.id;
                    return (
                        <button
                            key={tool.id}
                            onClick={() => onSelectTool(activeTool === tool.id ? "" : tool.id)}
                            className={`group relative w-auto flex flex-col items-center gap-1.5 py-2 md:py-4 px-4 md:px-0 transition-colors shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute md:left-0 md:top-0 md:bottom-0 top-0 left-0 right-0 h-1 md:h-full w-full md:w-1 bg-primary md:rounded-r-full rounded-b-full"
                                />
                            )}
                            <tool.icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'stroke-2' : 'stroke-1 group-hover:stroke-2'}`} />
                            <span className="text-[10px] font-manrope font-medium tracking-wide whitespace-nowrap">{tool.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-0 md:mt-auto hidden md:block">
                <button className="text-muted-foreground hover:text-foreground flex flex-col items-center gap-1.5 py-4">
                    <Settings className="w-6 h-6 stroke-1" />
                    <span className="text-[10px] font-manrope font-medium tracking-wide">Settings</span>
                </button>
            </div>

        </div>
    );
}
