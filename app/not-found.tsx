"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function NotFound() {
  const { user, signOut } = useAuth();
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
    await signOut({ returnTo: "/" });
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
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-white selection:bg-[#a3e635] selection:text-black overflow-hidden relative">
      {/* Decorative Background Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(163,230,53,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#a3e635] to-transparent opacity-20" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-[#a3e635] to-transparent opacity-20" />
      </div>

      {/* Navigation (Matched to Home) */}
      <nav className="w-full flex justify-between items-center z-50 p-4 md:p-8 relative">
        <Link href="/" className="font-bebas text-2xl md:text-3xl tracking-widest relative z-50 text-white hover:text-[#a3e635] transition-colors">
          VANDSLAB
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 md:gap-8 font-manrope text-sm md:text-base font-medium text-white">
          <Link href="/templates" className="hover:opacity-50 transition-opacity">
            TEMPLATES
          </Link>
          <Link href="/pricing" className="hover:opacity-50 transition-opacity">
            PRICING
          </Link>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-3 bg-white/10 pl-2 pr-4 py-1.5 rounded-full border border-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#a3e635] text-black flex items-center justify-center font-bold text-xs">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </div>
                )}
                <div className="flex flex-col leading-none text-left text-white">
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
                    className="absolute top-full right-0 mt-2 w-48 bg-[#171717] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1 text-white"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
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

          <div className="h-6 w-px bg-white/20 hidden md:block" />
          {/* Note: ThemeToggle might need adjustment for forced dark mode page, but keeping for consistency */}
          <div className="opacity-0 pointer-events-none w-0 h-0 overflow-hidden"><ThemeToggle /></div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center gap-4 z-50 text-white">
          <button onClick={toggleMenu} className="p-2 hover:text-[#a3e635] transition-colors">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center space-y-8 md:hidden text-white"
          >
            <Link href="/templates" className="font-bebas text-4xl hover:text-[#a3e635] transition-colors" onClick={toggleMenu}>
              TEMPLATES
            </Link>
            <Link href="/pricing" className="font-bebas text-4xl hover:text-[#a3e635] transition-colors" onClick={toggleMenu}>
              PRICING
            </Link>
            {user ? (
              <>
                <Link href="/templates" className="font-bebas text-4xl text-[#a3e635]" onClick={toggleMenu}>
                  MY DASHBOARD
                </Link>
                <button onClick={handleSignOut} className="font-bebas text-4xl text-red-400">
                  LOG OUT
                </button>
              </>
            ) : (
              <Link href="/api/auth/login" className="font-bebas text-4xl hover:text-[#a3e635] transition-colors" onClick={toggleMenu}>
                LOG IN
              </Link>
            )}
            <div className="pt-8">
              <p className="font-manrope text-sm opacity-50">© 2024 VANDSLAB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Centered & Scaled to fit */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-7xl mx-auto -mt-10">

        {/* 3D Hero Image */}
        <div className="relative w-full max-w-[600px] aspect-video animate-in fade-in zoom-in duration-1000 mb-6">
          <Image
            src="/assets/404-hero.png"
            alt="404 Page Not Found"
            fill
            className="object-contain drop-shadow-[0_0_50px_rgba(163,230,53,0.15)]"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="relative -mt-4 md:-mt-8 space-y-6">
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            Page Not Found
          </h1>

          <div className="w-16 h-1 bg-[#a3e635] mx-auto shadow-[0_0_15px_#a3e635]" />

          <p className="max-w-md mx-auto text-neutral-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
            We can't seem to find the page you're looking for. It might have been
            moved or deleted, or perhaps the blueprint was flawed.
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center px-8 py-3 bg-[#a3e635] text-black text-xs font-bold tracking-wider rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">RETURN TO HOMEPAGE</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="relative z-10 p-4 md:p-8 text-neutral-600 text-[10px] tracking-widest flex justify-between w-full opacity-50">
        <span>ERROR_CODE: 404</span>
        <span>SYSTEM_STATUS: NOMINAL</span>
      </div>
    </div>
  );
}

