"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../components/ThemeToggle";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProjectCard } from "./components/ProjectCard";

const FILTERS = [
    { id: "all", label: "All" },
    { id: "Menu", label: "Menu" },
    { id: "Custom", label: "Custom" },
    { id: "Social", label: "Social" },
];

export default function ProjectsPage() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Projects (Paginated)
    const { results: projects, status, loadMore } = usePaginatedQuery(
        api.projects.getPaginated,
        {},
        { initialNumItems: 12 }
    );

    const isLoading = status === "LoadingFirstPage";
    const canLoadMore = status === "CanLoadMore";

    // Filtering Logic (Client-side on loaded items)
    const filteredProjects = (projects || []).filter(project => {
        // Filter by Category
        const matchesFilter = activeFilter === "all" || (project.category || "Menu") === activeFilter;
        // Filter by Search (Title or Category)
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.category || "").toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background text-foreground p-8 md:p-12 overflow-x-hidden transition-colors duration-300">
            {/* Header */}
            <div className="max-w-[1600px] mx-auto mb-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-8">
                    <div>
                        <h1 className="font-bebas text-8xl md:text-9xl leading-[0.8] tracking-tight">
                            <span className="text-foreground">PRO</span>
                            <span className="text-lime-400">JECTS</span>
                        </h1>
                        <p className="mt-4 text-muted-foreground max-w-xl font-light text-lg">
                            Manage your restaurant menus and design assets.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto items-end">
                        {/* Top Nav Row */}
                        <div className="flex items-center gap-6 mb-2">
                            <Link
                                href="/"
                                className="text-sm font-bold text-muted-foreground hover:text-lime-400 transition-colors uppercase tracking-widest"
                            >
                                Home
                            </Link>
                            <Link
                                href="/templates"
                                className="text-sm font-bold text-muted-foreground hover:text-lime-400 transition-colors uppercase tracking-widest"
                            >
                                Templates
                            </Link>
                            <div className="scale-90">
                                <ThemeToggle />
                            </div>
                        </div>

                        {/* Search & CTA Row */}
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                            {/* Search */}
                            <div className="relative w-full md:w-80">
                                <input
                                    type="text"
                                    placeholder="Search loaded projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-full py-3 pl-6 pr-12 focus:outline-none focus:border-lime-400 transition-colors text-foreground placeholder:text-muted-foreground"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-lime-400 rounded-full text-black hover:scale-105 transition-transform">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>

                            {/* CTA */}
                            <Link
                                href="/templates"
                                className="bg-lime-400 hover:bg-lime-300 text-black font-bold font-oswald uppercase tracking-wide py-3 px-8 rounded-md transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Project</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex justify-end gap-3 flex-wrap">
                    {FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all uppercase tracking-wider ${activeFilter === filter.id
                                ? "bg-lime-400 text-black"
                                : "bg-transparent border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-lime-400" />
                </div>
            ) : (
                <>
                    <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProjects.map((project, index) => (
                            <ProjectCard key={project._id} project={project} index={index} />
                        ))}
                    </div>

                    {/* Load More Trigger */}
                    {canLoadMore && (
                        <div className="flex justify-center mt-16">
                            <button
                                onClick={() => loadMore(12)}
                                className="group relative overflow-hidden bg-background border border-border text-foreground px-8 py-3 rounded-full hover:border-lime-400 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-lime-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative font-oswald uppercase tracking-widest text-sm flex items-center gap-2">
                                    Load More Projects
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {!isLoading && filteredProjects.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center">
                    <p className="text-muted-foreground font-light mb-4">No projects found. Time to cook something up!</p>
                    <Link
                        href="/templates"
                        className="text-lime-400 hover:text-lime-300 underline underline-offset-4"
                    >
                        Browse Templates
                    </Link>
                </div>
            )}
        </div>
    );
}
