"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useRef } from "react";

// This provider wraps the children (pages) and animates the mask on route change

function FrozenRouter(props: { children: React.ReactNode }) {
    const context = useContext(LayoutRouterContext ?? {});
    const frozen = useRef(context).current;

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {props.children}
        </LayoutRouterContext.Provider>
    );
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Content variants to ensure the page itself is invisible until the mask is ready
    const contentVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: { delay: 0.2, duration: 0.4 } // Slight delay to let mask settle if needed
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.4 }
        }
    };

    const maskVariants = {
        initial: { opacity: 1 },
        animate: { opacity: 0 },
        exit: { opacity: 1 }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                className="w-full relative"
                initial="initial"
                animate="animate"
                exit="exit"
            >

                {/* The Mask - High Z-Index Overlay */}
                <motion.div
                    className="fixed inset-0 bg-black pointer-events-none z-[9999]"
                    variants={maskVariants}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* The Page Content - Wrapped to control visibility */}
                <motion.div variants={contentVariants} className="w-full bg-background min-h-screen">
                    <FrozenRouter>{children}</FrozenRouter>
                </motion.div>

            </motion.div>
        </AnimatePresence>
    );
}
