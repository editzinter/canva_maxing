"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoveUpRight, Menu, X, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

interface HeroProps {
    user?: {
        firstName?: string | null;
        lastName?: string | null;
        email?: string;
        profilePictureUrl?: string | null;
    } | null;
}

export function Hero({ user: propUser }: HeroProps) {
    // Fallback to propUser if context user isn't loaded yet, but strictly speaking AuthKitProvider wraps layout
    // so useAuth() might be better for consistent client-side state, specifically for signOut
    const { user: contextUser, signOut } = useAuth();

    // Prefer context user if available (for live updates), fall back to prop (server data)
    const user = contextUser || propUser;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        // We must pass returnTo, otherwise WorkOS tries to redirect to the "App Homepage" 
        // configured in the dashboard (which might be missing).
        await signOut({ returnTo: "/" });
    };

    const containerVars: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVars: Variants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const menuVars: Variants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.2, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            y: 10,
            scale: 0.95,
            transition: { duration: 0.15, ease: "easeIn" }
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-8 relative overflow-hidden transition-colors duration-500 bg-background text-foreground">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-between items-center z-50 mb-8 md:mb-0 relative"
            >
                <div className="font-bebas text-2xl md:text-3xl tracking-widest relative z-50">
                    VANDSLAB
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6 md:gap-8 font-manrope text-sm md:text-base font-medium">
                    <Link href="/templates" className="hover:opacity-50 transition-opacity">
                        TEMPLATES
                    </Link>
                    <Link href="#" className="hover:opacity-50 transition-opacity">
                        PRICING
                    </Link>

                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center gap-3 bg-secondary/10 pl-2 pr-4 py-1.5 rounded-full border border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer"
                            >
                                {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border/20" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-lime-400 text-black flex items-center justify-center font-bold text-xs">
                                        {user.firstName?.[0] || user.email?.[0] || "U"}
                                    </div>
                                )}
                                <div className="flex flex-col leading-none text-left">
                                    <span className="text-xs font-bold font-manrope uppercase">{user.firstName || "User"}</span>
                                    <span className="text-[10px] opacity-50 font-manrope">Logged In</span>
                                </div>
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        variants={menuVars}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="absolute top-full right-0 mt-2 w-48 bg-card border border-border/10 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                                    >
                                        <div className="px-4 py-3 border-b border-border/10">
                                            <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs opacity-50 truncate">{user.email}</p>
                                        </div>

                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link href="/api/auth/login" className="hover:opacity-50 transition-opacity uppercase">
                            Log In
                        </Link>
                    )}

                    <div className="h-6 w-px bg-border/50 hidden md:block" />
                    <ThemeToggle />
                </div>

                {/* Mobile Hamburger */}
                <div className="md:hidden flex items-center gap-4 z-50">
                    <ThemeToggle />
                    <button onClick={toggleMenu} className="p-2">
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-0 z-40 bg-background flex flex-col items-center justify-center space-y-8 md:hidden"
                    >
                        <Link href="/templates" className="font-bebas text-4xl" onClick={toggleMenu}>
                            TEMPLATES
                        </Link>
                        <Link href="#" className="font-bebas text-4xl" onClick={toggleMenu}>
                            PRICING
                        </Link>
                        {user ? (
                            <>
                                <Link href="/templates" className="font-bebas text-4xl text-lime-400" onClick={toggleMenu}>
                                    MY DASHBOARD
                                </Link>
                                <button onClick={handleSignOut} className="font-bebas text-4xl text-red-400">
                                    LOG OUT
                                </button>
                            </>
                        ) : (
                            <Link href="/api/auth/login" className="font-bebas text-4xl" onClick={toggleMenu}>
                                LOG IN
                            </Link>
                        )}
                        <div className="pt-8">
                            <p className="font-manrope text-sm opacity-50">© 2024 VANDSLAB</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                variants={containerVars}
                initial="hidden"
                animate="visible"
                className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto space-y-2 md:space-y-4 relative z-10"
            >
                {/* Row 1: TRANSFORMING */}
                <motion.div className="flex flex-col md:flex-row items-center justify-center w-full">
                    <motion.span variants={itemVars} className="font-bebas text-[16vw] md:text-[clamp(6rem,10vw,11rem)] leading-[0.85] tracking-tighter text-foreground">
                        TRANSFORMING
                    </motion.span>
                </motion.div>


                {/* Row 2: MENUS INTO */}
                <motion.div className="flex flex-col md:flex-row items-center justify-center w-full gap-2 md:gap-8">
                    <motion.span variants={itemVars} className="font-bebas text-[16vw] md:text-[clamp(6rem,10vw,11rem)] leading-[0.85] tracking-tighter text-foreground">
                        MENUS
                    </motion.span>

                    {/* Arrow Icon - Connecting S to I */}
                    <motion.div
                        variants={itemVars}
                        className="hidden md:flex items-center justify-center pt-2 -mx-4 md:-mx-8 relative z-20"
                    >
                        {/* EDIT SIZE HERE: We made it massive to bridge the gap */}
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 md:w-[180px] md:h-[180px] text-lime-400">
                            {/* Path optimized to start higher (short tail) to align with text baseline */}
                            <path d="M25 75 L85 15 M85 15 L35 15 M85 15 L85 65" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>

                    <motion.span variants={itemVars} className="font-bebas text-[16vw] md:text-[clamp(6rem,10vw,11rem)] leading-[0.85] tracking-tighter text-foreground">
                        INTO
                    </motion.span>
                </motion.div>

                {/* Row 3: EXPERIENCES */}
                <motion.div className="flex flex-col md:flex-row items-center justify-center w-full">
                    <motion.span variants={itemVars} className="font-bebas text-[16vw] md:text-[clamp(6rem,10vw,11rem)] leading-[0.85] tracking-tighter text-lime-400">
                        EXPERIENCES
                    </motion.span>
                </motion.div>

                {/* Central CTA */}
                <motion.div variants={itemVars} className="pt-8 md:pt-12">
                    <Link href="/templates">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 bg-lime-400 text-black pl-8 pr-6 py-4 rounded-full font-manrope font-bold text-lg cursor-pointer group"
                        >
                            Start Designing
                            <div className="bg-black text-lime-400 rounded-full p-1 group-hover:rotate-45 transition-transform duration-300">
                                <MoveUpRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>
            </motion.div>

            {/* DECORATIVE ELEMENTS (The "Cyber" Lines & Corners) */}

            {/* Top Right Corner Block */}
            <div className="absolute top-[88px] right-0 w-8 h-12 bg-lime-400 hidden xl:block z-0" />

            {/* Bottom Left Corner Block */}
            <div className="absolute bottom-[20px] left-[10%] w-8 h-12 bg-lime-400 hidden xl:block z-0" />

            {/* Floating Labels with Lines */}

            {/* MENU BUILDER - Top Left */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="absolute top-[30%] left-[10%] hidden xl:flex flex-col items-end opacity-70"
            >
                <div className="text-[10px] font-manrope font-bold uppercase tracking-widest text-right mb-2">
                    <p>MENU</p>
                    <p>BUILDER</p>
                </div>
                {/* Line */}
                <div className="w-16 h-[1px] bg-border/50 relative">
                    <div className="absolute top-0 right-0 w-[1px] h-8 bg-border/50 rotate-45 origin-top-right transform translate-y-[1px]" />
                </div>
            </motion.div>

            {/* AI MENU GENERATION - Right */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                className="absolute top-[25%] right-[15%] hidden xl:flex flex-col items-start opacity-70"
            >
                <div className="text-[10px] font-manrope font-bold uppercase tracking-widest text-left mb-2">
                    <p>AI MENU</p>
                    <p>GENERATION</p>
                </div>
                {/* Line */}
                <div className="w-24 h-[1px] bg-border/50 relative">
                    <div className="absolute top-0 left-0 w-[1px] h-12 bg-border/50 -rotate-45 origin-top-left transform translate-y-[1px]" />
                </div>
            </motion.div>

            {/* INSTANT EXPORT - Right Vertical Line area */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="absolute bottom-[30%] right-[20%] hidden xl:flex flex-col items-start opacity-70"
            >
                <div className="h-24 w-[1px] bg-border/50 mb-2" />
                <div className="text-[10px] font-manrope font-bold uppercase tracking-widest text-left">
                    <p>INSTANT</p>
                    <p>EXPORT &</p>
                    <p>PRINT</p>
                </div>
            </motion.div>

            {/* Footer Labels - Bottom Corners */}
            <div className="absolute bottom-6 left-6 hidden md:block opacity-50">
                <p className="text-[10px] font-manrope font-bold uppercase tracking-widest leading-relaxed">RESTAURANT<br />SOLUTIONS</p>
            </div>
            <div className="absolute bottom-6 right-6 hidden md:block opacity-50 text-right">
                <p className="text-[10px] font-manrope font-bold uppercase tracking-widest leading-relaxed">TEMPLATE<br />LIBRARY</p>
            </div>

        </div>
    );
}
