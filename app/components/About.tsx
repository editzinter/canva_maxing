"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function About() {
    const title = "ABOUT US";

    return (
        <section className="w-full py-24 md:py-32 bg-background text-foreground relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* Left Column: Text Content */}
                    <div className="space-y-12">
                        {/* Header */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-2 relative inline-block"
                        >
                            <h2 className="font-bebas text-[12vw] md:text-[8rem] leading-[0.85] tracking-tighter">
                                <span>ABOUT</span>
                                <span className="text-lime-400 ml-4">US</span>
                            </h2>
                            {/* Underline for ABOUT only */}
                            <motion.div
                                initial={{ scaleX: 0, originX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-1 bg-white w-[55%] absolute bottom-2 left-0" // Approximate width for "ABOUT"
                            />
                        </motion.div>

                        <div className="space-y-8 max-w-xl">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="font-manrope text-2xl md:text-3xl font-bold leading-tight"
                            >
                                We are builders of digital culinary experiences. Not just templates, but architectural blueprints for your brand's voice.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="font-manrope text-base md:text-lg text-muted-foreground leading-relaxed max-w-md"
                            >
                                Born from the intersection of minimal design and functional utility, Vandslab redefines how restaurants present themselves. We strip away the noise to reveal the essence of your menu.
                            </motion.p>
                        </div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                            className="group flex items-center gap-6 border border-white/30 px-8 py-4 uppercase font-bebas tracking-wider text-xl hover:bg-white hover:text-black transition-colors duration-300"
                        >
                            READ MANAGING PARTNER LETTER
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </div>

                    {/* Right Column: Image Grid */}
                    <div className="relative mt-12 lg:mt-0">

                        {/* Back Image (3D Shapes) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative z-10 w-[90%] ml-auto aspect-[4/5]"
                        >
                            {/* Lime Border Frame - Behind/Offset */}
                            <div className="absolute -top-6 -right-6 w-full h-full border-4 border-lime-400 z-0 hidden md:block" />

                            <img
                                src="/assets/images/about-3.png"
                                alt="Abstract 3D Shapes"
                                className="w-full h-full object-cover relative z-10 filter grayscale contrast-125"
                            />
                        </motion.div>

                        {/* Front Image (UI Dashboard) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 1 }}
                            className="absolute -bottom-12 left-0 w-[60%] aspect-square z-20"
                        >
                            <img
                                src="/assets/images/about-2.png"
                                alt="Dashboard UI"
                                className="w-full h-full object-cover border-[6px] border-lime-400 shadow-2xl"
                            />
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
