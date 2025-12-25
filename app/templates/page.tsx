"use client";

import React, { useMemo, useState } from "react";
import { Footer } from "@/app/components/Footer";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { TemplateCard } from "./components/TemplateCard";
import { NewProjectModal } from "./components/NewProjectModal";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { TEMPLATES } from "./manifest";

export default function TemplatesPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState<{ id: string; name: string } | null>(null);

    // Convert manifest to array and filter out 'blank' (handled separately)
    const allTemplates = useMemo(() => {
        return Object.values(TEMPLATES).filter(t => t.id !== "blank");
    }, []);

    // Derive detailed categories
    const categories = useMemo(() => {
        const cats = new Set(allTemplates.map(t => t.category));
        return ["All", ...Array.from(cats)];
    }, [allTemplates]);

    // Filter logic
    const displayedTemplates = useMemo(() => {
        if (selectedCategory === "All") return allTemplates;
        return allTemplates.filter(t => t.category === selectedCategory);
    }, [allTemplates, selectedCategory]);

    return (
        <main className="min-h-screen bg-background text-foreground dark:bg-[#050505] dark:text-white selection:bg-lime-400 selection:text-black flex flex-col font-manrope transition-colors duration-300">

            {/* Header / Nav */}
            <header className="w-full p-6 md:p-10 flex justify-between items-center max-w-[1600px] mx-auto z-20 relative">
                <Link
                    href="/"
                    className="flex items-center gap-3 bg-white pl-1 pr-6 py-1 rounded-full font-bebas text-xl text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] group"
                >
                    <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center group-hover:bg-lime-300 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-black stroke-[3px]" />
                    </div>
                    <span>BACK</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/projects"
                        className="text-sm font-bold text-muted-foreground hover:text-lime-400 transition-colors uppercase tracking-widest hidden md:block"
                    >
                        Projects
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 md:px-10 pt-4 pb-12 w-full max-w-[1600px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="font-bebas text-[12vw] md:text-8xl mb-6 tracking-tighter leading-[0.85]">
                        TEMPLATE <span className="text-lime-400">LIBRARY</span>
                    </h1>
                    <p className="font-manrope text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        Kickstart your menu design with our collection of premium, professionally crafted templates.
                    </p>
                </motion.div>

                {/* Filter Pills */}
                <div className="mt-12 flex flex-wrap gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {categories.map((cat, i) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-3 rounded-full border text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2
                                ${selectedCategory === cat
                                    ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.4)]'
                                    : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                                }
                            `}
                        >
                            {/* Simple Icons based on category text match could go here if available */}
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid */}
            <section className="px-6 md:px-10 pb-32 w-full max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

                    {/* Start from Scratch Card - Specific Design Match */}
                    <motion.div
                        onClick={() => {
                            setActiveTemplate({ id: "blank", name: "Blank Canvas" });
                            setIsModalOpen(true);
                        }}
                        className="w-full aspect-[3/4] bg-lime-400 rounded-[2.5rem] p-3 relative flex flex-col cursor-pointer group shadow-[0_0_40px_rgba(163,230,53,0.1)] hover:shadow-[0_0_60px_rgba(163,230,53,0.3)] transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Top Inset Black Screen */}
                        <div className="w-full h-[42%] bg-[#080808] rounded-[2rem] relative z-0" />

                        {/* Overlapping Button */}
                        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pt-3">
                            <div className="w-20 h-20 rounded-full bg-lime-400 border-[8px] border-[#080808] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                <Plus className="w-8 h-8 text-black stroke-[3px]" />
                            </div>
                        </div>

                        {/* Bottom Content */}
                        <div className="flex-1 flex flex-col items-center justify-center pt-8 text-center pb-4">
                            <p className="font-bebas text-3xl tracking-wide text-black leading-none mb-2">START FROM SCRATCH</p>
                            <p className="font-manrope text-sm tracking-wide text-black/70 font-semibold">Blank Canvas</p>
                        </div>
                    </motion.div>

                    {/* Template Cards */}
                    {displayedTemplates.map((t) => (
                        <TemplateCard
                            key={t.id}
                            title={t.name}
                            category={t.category}
                            image={t.thumbnail}
                            slug={t.id}
                            onClick={() => {
                                setActiveTemplate({ id: t.id, name: t.name });
                                setIsModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            </section>

            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                templateId={activeTemplate?.id || ""}
                templateName={activeTemplate?.name}
            />

            <Footer />
        </main>
    );
}
