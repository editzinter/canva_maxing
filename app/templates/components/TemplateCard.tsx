"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface TemplateCardProps {
    title: string;
    category: string;
    image: string;
    slug: string;
    onClick?: () => void;
}

export function TemplateCard({ title, category, image, onClick }: TemplateCardProps) {
    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="group relative w-full aspect-[3/4] bg-card hover:bg-lime-400 rounded-[2rem] p-3 transition-colors duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(163,230,53,0.3)] border border-border"
        >
            {/* Inner Image Container (Inset) */}
            <div className="relative w-full h-[75%] rounded-[1.5rem] overflow-hidden bg-black/20 shadow-inner">
                {/* Optional: Glossy top gradient for "Case" feel */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-white/5 pointer-events-none z-20 group-hover:opacity-50 transition-opacity" />

                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    unoptimized
                />

                {/* Dark overlay on default, fades out on hover to reveal bright image */}
                <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-300 z-10" />
            </div>

            {/* Bottom Text Content */}
            <div className="w-full h-[25%] flex flex-col justify-center px-4">
                <p className="font-manrope text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-black/60 transition-colors duration-300">
                    {category}
                </p>
                <h3 className="font-bebas text-3xl tracking-wide text-foreground group-hover:text-black transition-colors duration-300 mt-1 leading-none">
                    {title}
                </h3>
            </div>

            {/* Glossy Overlay Highlight on the Container */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/5 group-hover:border-black/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        </motion.div>
    );
}
