"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Instagram, Linkedin, Video } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-[#050505] text-white py-12 md:py-20 px-4 md:px-8 flex flex-col items-center border-t border-white/10 overflow-hidden relative">

            {/* Massive Brand Text - Moved to Top */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="w-full text-center relative z-10"
            >
                <h1 className="font-bebas text-[28vw] leading-[0.75] tracking-tighter text-white mb-16 select-none mix-blend-difference">
                    VANDSLAB
                </h1>
            </motion.div>

            {/* Grid Layout */}
            <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 font-manrope text-sm md:text-base uppercase tracking-wider relative z-10">

                {/* Navigate */}
                <div className="flex flex-col gap-6">
                    <h3 className="font-bebas text-2xl tracking-wide opacity-100 mb-2">Navigate</h3>
                    <Link href="#" className="hover:text-lime-400 transition-colors opacity-70 hover:opacity-100 font-bold">Studio</Link>
                    <Link href="#" className="hover:text-lime-400 transition-colors opacity-70 hover:opacity-100 font-bold">Approach</Link>
                    <Link href="#" className="hover:text-lime-400 transition-colors opacity-70 hover:opacity-100 font-bold">Projects</Link>
                    <Link href="#" className="hover:text-lime-400 transition-colors opacity-70 hover:opacity-100 font-bold">Blog</Link>
                </div>

                {/* Follow */}
                <div className="flex flex-col gap-6">
                    <h3 className="font-bebas text-2xl tracking-wide opacity-100 mb-2">Follow</h3>
                    <div className="flex gap-4">
                        <Link href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            <Video className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-6">
                    <h3 className="font-bebas text-2xl tracking-wide opacity-100 mb-2">Contact</h3>
                    <Link href="#" className="hover:text-lime-400 transition-colors opacity-70 hover:opacity-100 font-bold">Get Started</Link>
                    <a href="mailto:hello@vandslab.com" className="hover:text-lime-400 transition-colors opacity-70 hover:opacity-100 lowercase font-medium">
                        hello@vandslab.com
                    </a>
                </div>

                {/* Visit */}
                <div className="flex flex-col gap-6">
                    <h3 className="font-bebas text-2xl tracking-wide opacity-100 mb-2">Visit</h3>
                    <p className="normal-case opacity-70 leading-relaxed font-medium">
                        By Appointment Only<br />
                        730 Prangley Ave.<br />
                        Lancaster, PA 17603
                    </p>
                </div>

            </div>

            {/* Copyright */}
            <div className="w-full max-w-7xl mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[11px] font-manrope font-bold tracking-widest uppercase opacity-40 gap-4">
                <p>© 2024 VANDSLAB</p>
                <p>ALL RIGHTS RESERVED.</p>
                <p>WORK HARD, BE SATISFIED.</p>
            </div>

        </footer>
    );
}
