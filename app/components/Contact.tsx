"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";

export function Contact() {
    return (
        <section className="w-full bg-[#050505] text-white py-24 px-4 md:px-8 flex flex-col items-center relative overflow-hidden">

            {/* Background Texture/Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(50,50,50,0.2),transparent_70%)] pointer-events-none" />

            {/* Header */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16 relative z-10"
            >
                <h2 className="font-bebas text-5xl md:text-7xl mb-4 tracking-tight">CONTACT</h2>
                <p className="font-manrope text-sm md:text-base text-gray-400">
                    We'd love to talk about how we can work together.
                </p>
            </motion.div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">

                {/* Left: Form */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="border border-white/10 rounded-3xl p-8 md:p-10 bg-[#0a0a0a]/50 backdrop-blur-sm"
                >
                    <h3 className="font-manrope text-xs font-bold uppercase tracking-widest mb-8 text-gray-400">
                        FILL OUT THE FORM BELOW
                    </h3>

                    <form className="flex flex-col gap-6 font-manrope">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-400">First Name*</label>
                                <input type="text" placeholder="John" className="bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-lime-400 focus:outline-none transition-colors" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-400">Last Name*</label>
                                <input type="text" placeholder="Doe" className="bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-lime-400 focus:outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-400">Company Name*</label>
                                <input type="text" placeholder="Vandslab" className="bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-lime-400 focus:outline-none transition-colors" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-400">Job Title*</label>
                                <input type="text" placeholder="Product Manager" className="bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-lime-400 focus:outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-400">Work Email*</label>
                                <input type="email" placeholder="john@company.com" className="bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-lime-400 focus:outline-none transition-colors" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-400">Phone Number</label>
                                <input type="tel" placeholder="+1 (555) 000-0000" className="bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-lime-400 focus:outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-400">Project Description*</label>
                            <textarea placeholder="Tell us about your project..." rows={4} className="bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-lime-400 focus:outline-none transition-colors resize-none" />
                        </div>

                        <div className="flex flex-col gap-4 mt-2">
                            <label className="text-xs font-medium text-gray-400">What can we help with?</label>
                            <div className="grid grid-cols-1 gap-3">
                                {["Web Development", "UI/UX Design", "System Architecture", "AI Integration"].map((item) => (
                                    <label key={item} className="flex items-center gap-3 cursor-pointer group select-none">
                                        <div className="w-5 h-5 border border-white/20 rounded bg-[#111] flex items-center justify-center group-hover:border-lime-400 transition-colors">
                                            <div className="w-3 h-3 bg-lime-400 rounded-sm opacity-0" />
                                            {/* Note: In a real app we'd control state here, visual placebo for now */}
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button className="bg-lime-400 text-black font-manrope font-bold py-4 rounded-full mt-6 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                            Submit
                        </button>
                    </form>
                </motion.div>

                {/* Right: Visual Placeholder (Video/Feature) */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="hidden lg:flex flex-col items-center justify-start pt-12"
                >
                    <div className="flex flex-col items-center justify-center h-full relative w-full lg:pl-12">
                        <div className="relative w-full aspect-square max-w-[500px]">
                            {/* Glow effect behind the image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-lime-400/10 blur-[120px] rounded-full pointer-events-none" />

                            <img
                                src="/assets/images/contact-illustration.png"
                                alt="Cyberpunk Abstract Structure"
                                className="w-full h-full object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        </div>
                    </div>

                </motion.div>

            </div>
        </section>
    );
}
