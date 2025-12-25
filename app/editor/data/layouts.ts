
export interface LayoutConfig {
    id: string;
    label: string;
    roles: {
        [key: string]: {
            className: string;
            x?: number;
            y?: number;
            style?: React.CSSProperties;
        }
    }
}

export const LAYOUTS: Record<string, LayoutConfig> = {
    classic: {
        id: 'classic',
        label: 'Classic Elegant',
        roles: {
            title: {
                className: "absolute text-center font-bebas text-8xl text-[var(--theme-accent)] tracking-tighter leading-none z-10 pointer-events-auto w-full",
                x: 0,
                y: 120
            },
            subtitle: {
                className: "absolute text-center font-manrope text-[var(--theme-text)] tracking-[0.5em] text-sm uppercase z-10 pointer-events-auto w-full",
                x: 0,
                y: 220
            },
            'item-title': {
                className: "absolute text-left font-bebas text-2xl text-[var(--theme-primary)] z-10 pointer-events-auto",
                // x/y are relative to sequence in code, we'll handle offsets in main loop? 
                // actually we can just define base styles here.
            },
            'item-price': {
                className: "absolute text-right font-manrope text-lg text-[var(--theme-accent)] font-bold z-10 pointer-events-auto",
            },
            'item-desc': {
                className: "absolute text-left font-manrope text-xs text-neutral-400 z-10 pointer-events-auto w-[395px]",
            }
        }
    },
    minimal: {
        id: 'minimal',
        label: 'Ultra Minimal',
        roles: {
            title: {
                className: "absolute text-left font-bebas text-9xl text-[var(--theme-text)] leading-none z-10 pointer-events-auto",
                x: 60,
                y: 100
            },
            subtitle: {
                className: "absolute text-left font-manrope text-[var(--theme-accent)] tracking-widest text-xs uppercase z-10 pointer-events-auto",
                x: 65,
                y: 200
            },
            'item-title': {
                className: "absolute text-left font-manrope font-bold text-xl text-[var(--theme-text)] z-10 pointer-events-auto",
            },
            'item-price': {
                className: "absolute text-right font-manrope text-xl text-[var(--theme-accent)] z-10 pointer-events-auto",
            },
            'item-desc': {
                className: "absolute text-left font-manrope text-xs text-[var(--theme-text)] opacity-70 z-10 pointer-events-auto w-[300px]",
            }
        }
    },
    modern: {
        id: 'modern',
        label: 'Modern Cards',
        roles: {
            title: {
                className: "absolute text-center font-manrope font-bold text-6xl text-[var(--theme-text)] tracking-tight z-10 pointer-events-auto w-full",
                x: 0,
                y: 80
            },
            subtitle: {
                className: "absolute text-center font-manrope text-[var(--theme-accent)] text-sm z-10 pointer-events-auto w-full",
                x: 0,
                y: 150
            },
            'item-title': {
                className: "absolute text-left font-bebas text-3xl text-[var(--theme-primary)] z-10 pointer-events-auto",
            },
            'item-price': {
                className: "absolute text-right font-manrope text-2xl text-[var(--theme-accent)] font-bold z-10 pointer-events-auto",
            },
            'item-desc': {
                className: "absolute text-left font-manrope text-sm text-neutral-500 z-10 pointer-events-auto w-[350px]",
            }
        }
    },
    bistro: {
        id: 'bistro',
        label: 'Visual Bistro',
        roles: {
            title: {
                className: "absolute text-left font-bebas text-8xl text-[var(--theme-primary)] tracking-tight z-10 pointer-events-auto w-[300px] leading-[0.8]",
                x: 40,
                y: 60
            },
            subtitle: {
                className: "absolute text-left font-manrope text-[var(--theme-accent)] font-bold bg-[var(--theme-bg)] px-2 py-1 text-xs uppercase z-10 pointer-events-auto tracking-widest border border-[var(--theme-text)]",
                x: 40,
                y: 240
            },
            'item-title': {
                className: "absolute text-left font-bebas text-2xl text-[var(--theme-text)] z-10 pointer-events-auto border-b border-[var(--theme-accent)]/20 pb-1 w-[250px]",
            },
            'item-price': {
                className: "absolute text-right font-manrope text-lg text-[var(--theme-primary)] font-bold z-10 pointer-events-auto",
            },
            'item-desc': {
                className: "absolute text-left font-manrope text-[10px] text-neutral-500 z-10 pointer-events-auto w-[250px]",
            }
        }
    }
};
