import React, { useState } from "react";
import { Download, Check, FileType, Loader2, ChevronDown, FileText, Image as ImageIcon, Layers, WholeWord, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ExportOptions {
    format: 'png' | 'jpeg' | 'pdf';
    scope: 'current' | 'all' | 'custom';
    pages: number[]; // 0-indexed page indices to export
}

interface ExportButtonProps {
    totalPages: number;
    currentPageIndex: number;
    onExport: (options: ExportOptions) => Promise<void>;
}

export function ExportButton({ totalPages, currentPageIndex, onExport }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Internal State
    const [format, setFormat] = useState<'png' | 'jpeg' | 'pdf'>('pdf');
    const [scope, setScope] = useState<'current' | 'all' | 'custom'>('all');
    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(totalPages);

    const handleExportClick = async () => {
        setIsExporting(true);

        let pagesToExport: number[] = [];

        if (scope === 'current') {
            pagesToExport = [currentPageIndex];
        } else if (scope === 'all') {
            pagesToExport = Array.from({ length: totalPages }, (_, i) => i);
        } else {
            // Custom Range (1-based input to 0-based index)
            const start = Math.max(1, Math.min(rangeStart, totalPages));
            const end = Math.max(start, Math.min(rangeEnd, totalPages));
            for (let i = start; i <= end; i++) {
                pagesToExport.push(i - 1);
            }
        }

        await onExport({ format, scope, pages: pagesToExport });

        setTimeout(() => {
            setIsExporting(false);
            setIsOpen(false);
        }, 1000);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className={`
                    relative overflow-hidden
                    font-manrope font-bold text-xs px-5 py-2.5 rounded-full 
                    flex items-center gap-2 transition-all duration-300
                    ${isExporting
                        ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed pr-4 pl-4'
                        : 'bg-primary text-primary-foreground hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/25'
                    }
                `}
            >
                <AnimatePresence mode="wait">
                    {isExporting ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Exporting...</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export</span>
                            <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
            )}

            <AnimatePresence>
                {isOpen && !isExporting && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-72 p-4 bg-card/95 backdrop-blur-xl border border-border/10 rounded-2xl shadow-2xl flex flex-col gap-4 text-left"
                    >
                        {/* Format Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                                <FileType className="w-3 h-3" /> Format
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['pdf', 'png', 'jpeg'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFormat(f)}
                                        className={`
                                            px-2 py-2 rounded-lg text-xs font-bold uppercase transition-all border
                                            ${format === f
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                                            }
                                        `}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scope Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                                <Layers className="w-3 h-3" /> Pages
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="scope"
                                        checked={scope === 'current'}
                                        onChange={() => setScope('current')}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm font-medium">Current Page <span className="text-muted-foreground text-xs">({currentPageIndex + 1})</span></span>
                                </label>
                                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="scope"
                                        checked={scope === 'all'}
                                        onChange={() => setScope('all')}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm font-medium">All Pages <span className="text-muted-foreground text-xs">(1-{totalPages})</span></span>
                                </label>
                                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="scope"
                                        checked={scope === 'custom'}
                                        onChange={() => setScope('custom')}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm font-medium">Custom Range</span>
                                </label>

                                {scope === 'custom' && (
                                    <div className="flex items-center gap-2 pl-8 animate-in slide-in-from-top-1">
                                        <input
                                            type="number"
                                            min="1" max={totalPages}
                                            value={rangeStart}
                                            onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                                            className="w-16 bg-muted border border-border/20 rounded px-2 py-1 text-sm text-center"
                                        />
                                        <span className="text-xs text-muted-foreground">to</span>
                                        <input
                                            type="number"
                                            min={rangeStart} max={totalPages}
                                            value={rangeEnd}
                                            onChange={(e) => setRangeEnd(parseInt(e.target.value) || 1)}
                                            className="w-16 bg-muted border border-border/20 rounded px-2 py-1 text-sm text-center"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleExportClick}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all mt-2"
                        >
                            Download {format.toUpperCase()}
                        </button>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
