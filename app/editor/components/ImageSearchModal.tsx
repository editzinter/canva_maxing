import React, { useState } from 'react';
import { Search, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { usePexels, PexelsPhoto } from '@/app/hooks/usePexels';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export function ImageSearchModal({ isOpen, onClose, onSelect }: ImageSearchModalProps) {
    const { loading, error, photos, searchPhotos } = usePexels();
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchPhotos(query);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-card w-full max-w-2xl h-[600px] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search for photos (e.g., 'minimalist coffee', 'abstract texture')"
                            className="w-full bg-muted/30 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </form>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-muted/5">
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-xs font-medium">Searching Pexels...</p>
                        </div>
                    )}

                    {!loading && photos.length === 0 && !error && (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground opacity-50">
                            <ImageIcon className="w-12 h-12" />
                            <p className="text-sm">Search for something inspiring</p>
                        </div>
                    )}

                    {!loading && photos.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {photos.map((photo) => (
                                <button
                                    key={photo.id}
                                    onClick={() => onSelect(photo.src.large2x)}
                                    className="relative aspect-square rounded-lg overflow-hidden group bg-muted hover:ring-2 hover:ring-primary transition-all"
                                >
                                    <img
                                        src={photo.src.medium}
                                        alt={photo.alt}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[9px] text-white truncate text-left">{photo.photographer}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
