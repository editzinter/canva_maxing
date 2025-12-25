"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const lenisRef = useRef<Lenis | null>(null);
    const rafIdRef = useRef<number | null>(null);

    // Disable Lenis on editor pages to allow Fabric.js canvas interactions (zoom/pan)
    const isEditor = pathname?.startsWith("/editor");

    useEffect(() => {
        // If we are in the editor, ensure Lenis is destroyed/disabled and body is clean
        if (isEditor) {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            return;
        }

        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
            lenis.raf(time);
            rafIdRef.current = requestAnimationFrame(raf);
        }

        rafIdRef.current = requestAnimationFrame(raf);

        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            lenis.destroy();
            lenisRef.current = null;
            document.body.style.overflow = '';
        };
    }, [isEditor]); // Only re-run when entering/leaving editor context

    // Handle Route Changes (Scroll to top)
    // Handle Resize & Route Changes
    useEffect(() => {
        if (!isEditor && lenisRef.current) {
            // 1. Immediate scroll to top on navigation
            lenisRef.current.scrollTo(0, { immediate: true });

            // 2. ROBUST FIX: Use ResizeObserver
            // Instead of guessing with timeouts, we watch the body for height changes.
            // This catches animations, measuring, image loading, everything.
            const observer = new ResizeObserver(() => {
                lenisRef.current?.resize();
            });

            observer.observe(document.body);

            return () => {
                observer.disconnect();
            };
        }
    }, [pathname, isEditor]);

    return <>{children}</>;
}

