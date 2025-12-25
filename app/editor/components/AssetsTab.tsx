import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, Search, PlusCircle } from "lucide-react";

interface AssetFile {
    name: string;
    url: string;
    thumbnail?: string;
    label: string;
}

interface AssetsTabProps {
    onAddSvg: (url: string) => Promise<void>;
}

const AssetItem = React.memo(({ asset, onAdd }: { asset: AssetFile, onAdd: (url: string) => Promise<void> }) => {
    const [adding, setAdding] = useState(false);

    const handleClick = () => {
        if (adding) return;
        setAdding(true);

        // Yield to main thread to allow UI to update (show spinner) 
        // before starting the heavy SVG parsing
        setTimeout(async () => {
            try {
                await onAdd(asset.url);
            } finally {
                setAdding(false);
            }
        }, 50);
    };

    return (
        <button
            onClick={handleClick}
            className="aspect-square border border-border/10 rounded-lg p-2 flex flex-col items-center justify-center gap-2 transition-all group relative overflow-hidden"
            style={{
                backgroundImage: `
                    linear-gradient(45deg, #80808022 25%, transparent 25%), 
                    linear-gradient(-45deg, #80808022 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #80808022 75%), 
                    linear-gradient(-45deg, transparent 75%, #80808022 75%)
                `,
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                backgroundColor: 'rgba(128,128,128,0.05)'
            }}
            title={asset.label}
            disabled={adding}
        >
            <img
                src={asset.thumbnail || asset.url}
                alt={asset.label}
                loading="lazy"
                decoding="async"
                className={`w-8 h-8 transition-opacity duration-300 ${adding ? 'opacity-20' : 'opacity-70 group-hover:opacity-100'}`}
            />
            {adding && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
            )}
            {!adding && (
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlusCircle className="w-3 h-3 text-primary" />
                </div>
            )}
        </button>
    );
});

// Basic Debounce Hook (Inline to avoid new file if possible, or use existing)
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

export function AssetsTab({ onAddSvg }: AssetsTabProps) {
    const [assets, setAssets] = useState<AssetFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300); // 300ms debounce

    // Pagination state (Reduced initial load to prevent lag)
    const [visibleCount, setVisibleCount] = useState(12);
    const containerRef = useRef<HTMLDivElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await fetch("/api/assets");
                const data = await response.json();
                if (data.files) {
                    setAssets(data.files);
                }
            } catch (error) {
                console.error("Failed to fetch assets:", error);
            } finally {
                setLoading(false);
            }
        };

        // Delay fetch slightly to allow ToolPanel animation to finish? 
        // No, user wants it fast. But maybe run it inside requestIdleCallback if available?
        // Let's just run it.
        fetchAssets();
    }, []);

    // Reset pagination when search changes
    useEffect(() => {
        setVisibleCount(12);
        if (containerRef.current) containerRef.current.scrollTop = 0;
    }, [debouncedSearch]);

    const filteredAssets = React.useMemo(() => {
        return assets.filter(asset =>
            asset.label.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [assets, debouncedSearch]);

    const visibleAssets = React.useMemo(() => {
        return filteredAssets.slice(0, visibleCount);
    }, [filteredAssets, visibleCount]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < filteredAssets.length) {
                    // Load more in small chunks
                    setVisibleCount((prev) => Math.min(prev + 12, filteredAssets.length));
                }
            },
            { root: containerRef.current, threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [filteredAssets.length, visibleCount]);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <h3 className="font-manrope font-bold text-sm shrink-0">Vector Assets</h3>

            <div className="relative mb-2 shrink-0">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="w-full bg-muted rounded-lg pl-10 pr-4 py-2 text-xs font-manrope focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                </div>
            ) : (
                <div ref={containerRef} className="flex-1 overflow-y-auto pr-1">
                    <div className="pb-8">
                        {/* Render in Chunks for content-visibility optimization */}
                        {Array.from({ length: Math.ceil(visibleAssets.length / 24) }).map((_, chunkIndex) => {
                            const chunk = visibleAssets.slice(chunkIndex * 24, (chunkIndex + 1) * 24);
                            return (
                                <div
                                    key={chunkIndex}
                                    className="grid grid-cols-3 gap-3 mb-3"
                                    style={{
                                        contentVisibility: 'auto',
                                        containIntrinsicSize: '300px' // Approx height of 8 rows (grid-cols-3)
                                    }}
                                >
                                    {chunk.map((asset) => (
                                        <AssetItem key={asset.name} asset={asset} onAdd={onAddSvg} />
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* Infinite Scroll Target */}
                    <div ref={observerTarget} className="h-4 w-full" />

                    {filteredAssets.length === 0 && (
                        <div className="text-center py-8 opacity-50 text-xs">
                            No assets found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
