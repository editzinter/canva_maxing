"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoveUpRight } from "lucide-react";

export function WhatWeDo() {
    const services = [
        "MENU ENGINEERING",
        "BRAND IDENTITY",
        "DIGITAL LAYOUTS",
        "PRINT OPTIMIZATION"
    ];

    const title = "WHAT WE DO";

    return (
        <section className="w-full py-24 md:py-32 bg-white text-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Images (Left on Desktop) */}
                    <div className="relative order-2 lg:order-1 h-full min-h-[500px] flex items-center">
                        {/* Back Image (Light/White theme) - Centered/Left */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="absolute top-0 left-0 w-[70%] aspect-[3/4] z-0 grayscale opacity-80"
                        >
                            <img
                                src="/assets/images/about-1.png"
                                alt="Structure"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Front Image (Dark/Gold/Contrast) - Centered/Right */}
                        <motion.div
                            initial={{ clipPath: "inset(0 0 100% 0)" }}
                            whileInView={{ clipPath: "inset(0 0 0 0)" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-[15%] right-0 w-[65%] aspect-[3/4] z-10 shadow-2xl"
                        >
                            <div className="absolute inset-0 border-r-4 border-b-4 border-white z-20 pointer-events-none" />
                            <img
                                src="/assets/images/about-4.png"
                                alt="Cubes"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>


                    {/* Content (Right on Desktop) */}
                    <div className="order-1 lg:order-2 flex flex-col justify-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="overflow-hidden mb-8"
                        >
                            <motion.h2
                                className="font-bebas text-[12vw] md:text-[6rem] leading-[0.85] tracking-tighter text-black flex overflow-hidden"
                                transition={{ staggerChildren: 0.05 }}
                            >
                                {title.split("").map((char, i) => (
                                    <motion.span
                                        key={i}
                                        variants={{
                                            hidden: { y: "100%" },
                                            visible: { y: 0 }
                                        }}
                                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                            </motion.h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="font-manrope text-lg md:text-xl font-medium mb-12 opacity-80 max-w-lg leading-relaxed"
                        >
                            We transform chaos into clarity. Our AI-driven design engine takes your raw inputs and constructs professional, aesthetically rigid menus in seconds.
                        </motion.p>

                        <motion.div
                            className="grid grid-cols-1"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ staggerChildren: 0.1, delayChildren: 0.4 }}
                        >
                            {services.map((service, i) => (
                                <motion.div
                                    key={service}
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="flex items-center gap-6 py-6 border-b border-black/10 group cursor-default"
                                >
                                    <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45">
                                        <MoveUpRight className="w-5 h-5 text-black stroke-[3px]" />
                                    </div>
                                    <span className="font-bebas text-2xl md:text-3xl tracking-wide pt-1">{service}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
}
