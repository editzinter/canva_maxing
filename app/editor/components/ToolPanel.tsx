"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Type,
    Image as ImageIcon,
    Square,
    Circle,
    Minus,
    LayoutTemplate,
    Palette,
    Settings,
    ChevronRight,
    Check,
    Trash2,
    Copy,
    Layers,
    ArrowUp,
    ArrowDown,
    Sparkles,
    Layout,
    Loader2,
    ChefHat,
    Plus,
    SlidersHorizontal
} from "lucide-react";
import { usePexels } from "@/app/hooks/usePexels";
import { AssetsTab } from "./AssetsTab";

interface ToolPanelProps {
    isOpen: boolean;
    activeTool: string;
    onAddText: (type: 'headline' | 'subhead' | 'body', text?: string) => void;
    onUpdateBackground: (color: string) => void;
    onUpdateTheme: (colors: string[]) => void;
    onUpdateTexture: (texture: 'none' | 'grain' | 'paper') => void;
    onUpdateLayout: (layout: string) => void;
    activeTexture?: 'none' | 'grain' | 'paper';
    activeLayout?: string;
    onAddImage: (src: string) => void;
    onAddShape: (shapeType: 'rect' | 'circle' | 'line' | 'triangle' | 'diamond' | 'hexagon' | 'pentagon' | 'octagon' | 'star', options?: { fill?: string; stroke?: string; strokeWidth?: number }) => void;
    onAddSvg: (url: string) => Promise<void>;
    onUpdateItemContent?: (id: string, content: string) => void;

    // Valid CanvasItem from EditorCanvas export or any
    activeItem?: any;
    onUpdateItemStyle: (id: string, updates: any) => void;
    onUpdateBackgroundImage: (src: string) => void;
    onUpdateBackgroundStyle: (style: { opacity?: number }) => void;
}

export function ToolPanel({
    isOpen,
    activeTool,
    onAddText,
    onUpdateBackground,
    onUpdateTheme,
    onUpdateTexture,
    activeTexture,
    onUpdateLayout,
    activeLayout,
    onAddImage,
    onAddShape,
    onAddSvg,
    onUpdateItemContent,
    activeItem,
    onUpdateItemStyle,
    onUpdateBackgroundImage,
    onUpdateBackgroundStyle
}: ToolPanelProps) {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState("");
    const [bgOpacity, setBgOpacity] = useState(1); // 1 = 100%

    // Image Search State
    const { loading: imagesLoading, error: imagesError, photos, searchPhotos } = usePexels();
    const [imageQuery, setImageQuery] = useState("");

    // Background Image Search State
    const { loading: bgLoading, photos: bgPhotos, searchPhotos: searchBgPhotos } = usePexels();
    const [bgQuery, setBgQuery] = useState("");

    // Image editing local state (for responsive sliders)
    const [imgCornerRadius, setImgCornerRadius] = useState(0);
    const [imgBorderWidth, setImgBorderWidth] = useState(0);
    const [imgOpacity, setImgOpacity] = useState(1);

    // Sync local state when activeItem changes
    useEffect(() => {
        if (activeItem && activeItem.type === 'image') {
            setImgCornerRadius((activeItem as any).cornerRadius || 0);
            setImgBorderWidth((activeItem as any).strokeWidth || 0);
            setImgOpacity((activeItem as any).opacity ?? 1);
        }
    }, [activeItem]);

    const handleImageSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchPhotos(imageQuery);
    };

    const handleBgSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchBgPhotos(bgQuery);
    };

    // Initial search
    useEffect(() => {
        if (activeTool === 'photos' && photos.length === 0) {
            searchPhotos("abstract texture");
        }
        if (activeTool === 'background' && bgPhotos.length === 0) {
            searchBgPhotos("texture pattern"); // Default query for backgrounds
        }
    }, [activeTool]);

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            setAiResult(`Succulent ${prompt} with truffle infusion and aged balsamic glaze.`);
            setIsGenerating(false);
        }, 1500);
    };

    const handlePhotoClick = (src: string) => {
        if (activeItem && activeItem.type === 'image' && onUpdateItemContent) {
            onUpdateItemContent(activeItem.id, src);
        } else {
            onAddImage(src);
        }
    };

    const renderContent = () => {
        switch (activeTool) {
            case "text":
                return (
                    <div className="space-y-6">
                        <h3 className="font-manrope font-bold text-sm">Add Text</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => onAddText('headline')} className="bg-muted hover:bg-muted/80 p-4 rounded-lg text-left transition-colors group">
                                <h4 className="font-bebas text-3xl group-hover:text-primary transition-colors">Add a Headline</h4>
                            </button>
                            <button onClick={() => onAddText('subhead')} className="bg-muted hover:bg-muted/80 p-4 rounded-lg text-left transition-colors group">
                                <h5 className="font-manrope font-bold text-lg group-hover:text-primary transition-colors">Add a Subheading</h5>
                            </button>
                            <button onClick={() => onAddText('body')} className="bg-muted hover:bg-muted/80 p-4 rounded-lg text-left transition-colors group">
                                <p className="font-manrope text-sm group-hover:text-primary transition-colors">Add a little bit of body text</p>
                            </button>
                        </div>

                        {/* Text Properties - Show only if text item selected */}
                        {activeItem && ['text', 'textbox', 'i-text'].includes(activeItem.type) ? (
                            <div className="space-y-4 pt-4 border-t border-border/10 animate-in slide-in-from-bottom-2 fade-in">
                                <h3 className="font-manrope font-bold text-xs opacity-50 uppercase tracking-wider">Text Style</h3>

                                {/* Font Family */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-bold opacity-70">Font Family</label>
                                    <div className="h-60 overflow-y-auto pr-2 custom-scrollbar space-y-4">

                                        {/* SANS SERIF */}
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 mb-2 uppercase tracking-widest pl-1">Sans Serif</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: 'font-manrope', label: 'Manrope', class: 'font-manrope' },
                                                    { id: 'font-inter', label: 'Inter', class: 'font-inter' },
                                                    { id: 'font-outfit', label: 'Outfit', class: 'font-outfit' },
                                                    { id: 'font-dm-sans', label: 'DM Sans', class: 'font-dm-sans' },
                                                    { id: 'font-space', label: 'Space Grotesk', class: 'font-space' },
                                                    { id: 'font-archivo', label: 'Archivo', class: 'font-archivo' },
                                                    { id: 'font-tenor', label: 'Tenor Sans', class: 'font-tenor' },
                                                    { id: 'font-roboto', label: 'Roboto', class: 'font-roboto' },
                                                    { id: 'font-montserrat', label: 'Montserrat', class: 'font-montserrat' },
                                                    { id: 'font-open-sans', label: 'Open Sans', class: 'font-open-sans' },
                                                    { id: 'font-lato', label: 'Lato', class: 'font-lato' },
                                                    { id: 'font-poppins', label: 'Poppins', class: 'font-poppins' },
                                                    { id: 'font-raleway', label: 'Raleway', class: 'font-raleway' },
                                                ].map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => onUpdateItemStyle(activeItem.id, { fontClass: font.class })}
                                                        className={`p-2 rounded border text-center text-sm ${font.class} ${activeItem.className?.includes(font.class) ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted border-border/40'}`}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SERIF */}
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 mb-2 uppercase tracking-widest pl-1">Serif</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: 'font-bodoni', label: 'Bodoni Moda', class: 'font-bodoni' },
                                                    { id: 'font-prata', label: 'Prata', class: 'font-prata' },
                                                    { id: 'font-cormorant', label: 'Cormorant', class: 'font-cormorant' },
                                                    { id: 'font-playfair', label: 'Playfair', class: 'font-playfair' },
                                                    { id: 'font-dm-serif', label: 'DM Serif', class: 'font-dm-serif' },
                                                    { id: 'font-libre', label: 'Libre Baskerville', class: 'font-libre' },
                                                    { id: 'font-merriweather', label: 'Merriweather', class: 'font-merriweather' },
                                                    { id: 'font-lora', label: 'Lora', class: 'font-lora' },
                                                    { id: 'font-cinzel', label: 'Cinzel', class: 'font-cinzel' },
                                                    { id: 'font-abril', label: 'Abril Fatface', class: 'font-abril-fatface' },
                                                ].map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => onUpdateItemStyle(activeItem.id, { fontClass: font.class })}
                                                        className={`p-2 rounded border text-center text-sm ${font.class} ${activeItem.className?.includes(font.class) ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted border-border/40'}`}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* DISPLAY */}
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 mb-2 uppercase tracking-widest pl-1">Display</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: 'font-syne', label: 'Syne', class: 'font-syne' },
                                                    { id: 'font-italiana', label: 'Italiana', class: 'font-italiana' },
                                                    { id: 'font-julius', label: 'Julius Sans', class: 'font-julius' },
                                                    { id: 'font-marcellus', label: 'Marcellus', class: 'font-marcellus' },
                                                    { id: 'font-forum', label: 'Forum', class: 'font-forum' },
                                                    { id: 'font-bebas', label: 'Bebas Neue', class: 'font-bebas' },
                                                    { id: 'font-oswald', label: 'Oswald', class: 'font-oswald' },
                                                    { id: 'font-lobster', label: 'Lobster', class: 'font-lobster' },
                                                    { id: 'font-marker', label: 'Perm. Marker', class: 'font-permanent-marker' },
                                                ].map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => onUpdateItemStyle(activeItem.id, { fontClass: font.class })}
                                                        className={`p-2 rounded border text-center text-sm ${font.class} ${activeItem.className?.includes(font.class) ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted border-border/40'}`}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SCRIPT */}
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 mb-2 uppercase tracking-widest pl-1">Script</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: 'font-pinyon', label: 'Pinyon', class: 'font-pinyon' },
                                                    { id: 'font-alex', label: 'Alex Brush', class: 'font-alex' },
                                                    { id: 'font-mrs-saint', label: 'Mrs Saint', class: 'font-mrs-saint' },
                                                    { id: 'font-vibes', label: 'Great Vibes', class: 'font-great-vibes' },
                                                    { id: 'font-dancing', label: 'Dancing', class: 'font-dancing-script' },
                                                    { id: 'font-pacifico', label: 'Pacifico', class: 'font-pacifico' },
                                                ].map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => onUpdateItemStyle(activeItem.id, { fontClass: font.class })}
                                                        className={`p-2 rounded border text-center text-sm ${font.class} ${activeItem.className?.includes(font.class) ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted border-border/40'}`}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Font Size */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold opacity-70">Font Size</label>
                                        <span className="text-[10px] opacity-70">
                                            {activeItem.style?.fontSize ? parseInt(activeItem.style.fontSize as string) : 'Auto'}px
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="12"
                                        max="200"
                                        step="1"
                                        value={activeItem.style?.fontSize ? parseInt(activeItem.style.fontSize as string) : 24}
                                        onChange={(e) => onUpdateItemStyle(activeItem.id, { style: { ...activeItem.style, fontSize: `${e.target.value}px` } })}
                                        className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Text Color */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold opacity-70">Color</label>
                                        <span className="text-[10px] opacity-70">
                                            {activeItem.style?.color || "#ffffff"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {["#000000", "#FFFFFF", "#F5F5F5", "#d4d4d4", "#a3a3a3", "#737373", "#d9f99d", "#fca5a5", "#93c5fd", "#fdba74"].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => onUpdateItemStyle(activeItem.id, { style: { ...activeItem.style, color: c } })}
                                                className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform ${activeItem.style?.color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-border/10'}`}
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Text Align (Optional extra) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-70">Alignment</label>
                                    <div className="flex bg-muted rounded-lg p-1">
                                        {['text-left', 'text-center', 'text-right'].map((align) => (
                                            <button
                                                key={align}
                                                onClick={() => onUpdateItemStyle(activeItem.id, { alignClass: align })}
                                                className={`flex-1 py-1 rounded text-xs ${activeItem.className?.includes(align) ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {align === 'text-left' ? 'L' : align === 'text-center' ? 'C' : 'R'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-border/10 text-center opacity-50">
                                <p className="text-xs font-manrope italic">Select text on the canvas to edit style.</p>
                            </div>
                        )}
                    </div>
                );

            case "background":
                return (
                    <div className="space-y-6">
                        <h3 className="font-manrope font-bold text-sm">Backgrounds</h3>
                        <div>
                            <label className="text-xs font-bold opacity-50 mb-3 block">SOLID COLORS</label>
                            <div className="grid grid-cols-5 gap-3">
                                {["#000000", "#FFFFFF", "#F5F5F5", "#18181b", "#d9f99d", "#fca5a5", "#93c5fd", "#fdba74", "#d8b4fe", "#cbd5e1"].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => onUpdateBackground(c)}
                                        className="w-10 h-10 rounded-full border border-black/10 shadow-sm hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <hr className="border-border/20" />

                        {/* IMAGE SETTINGS */}
                        <div>
                            <label className="text-xs font-bold opacity-50 mb-3 block">IMAGE SETTINGS</label>

                            {/* Opacity Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase font-bold opacity-70">Opacity</label>
                                    <span className="text-[10px] opacity-70">{Math.round(bgOpacity * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={bgOpacity}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setBgOpacity(val);
                                        onUpdateBackgroundStyle({ opacity: val });
                                    }}
                                    className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <hr className="border-border/20" />

                        {/* TEXTURES / PEXELS */}
                        <div>
                            <h3 className="font-manrope font-bold text-sm mb-3">Textures</h3>
                            <form onSubmit={handleBgSearch} className="relative mb-4">
                                <input
                                    type="text"
                                    value={bgQuery}
                                    onChange={(e) => setBgQuery(e.target.value)}
                                    placeholder="Search Pexels Textures..."
                                    className="w-full bg-muted rounded-lg pl-10 pr-4 py-2 text-xs font-manrope focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                            </form>

                            {bgLoading && (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                                </div>
                            )}

                            {!bgLoading && (
                                <div className="grid grid-cols-2 gap-2">
                                    {bgPhotos.slice(0, 10).map((photo) => (
                                        <button
                                            key={photo.id}
                                            onClick={() => onUpdateBackgroundImage(photo.src.large2x)}
                                            className="relative aspect-video rounded-md overflow-hidden hover:opacity-80 transition-opacity border border-border/10"
                                        >
                                            <img src={photo.src.medium} alt={photo.alt} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div >
                );

            case "photos":
                return (
                    <div className="space-y-6">
                        <h3 className="font-manrope font-bold text-sm">Photos</h3>

                        {/* Image Editing Panel - Shows FIRST when image is selected */}
                        {activeItem && activeItem.type === 'image' && (
                            <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border/20 animate-in slide-in-from-top-2 fade-in">
                                <h3 className="font-manrope font-bold text-xs opacity-70 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" />
                                    Image Style
                                </h3>

                                {/* Clip Shape */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-70">Clip Shape</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'none', label: 'None' },
                                            { id: 'circle', label: 'Circle' },
                                            { id: 'rounded', label: 'Rounded' },
                                            { id: 'square', label: 'Square' },
                                        ].map(clip => (
                                            <button
                                                key={clip.id}
                                                onClick={() => onUpdateItemStyle((activeItem as any).customId || '', { clipShape: clip.id })}
                                                className={`p-2 rounded border text-center text-xs transition-colors ${(activeItem as any).clipShape === clip.id
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-background hover:bg-muted border-border/40'
                                                    }`}
                                            >
                                                {clip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Corner Radius (for rounded) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold opacity-70">Corner Radius</label>
                                        <span className="text-[10px] opacity-70">{imgCornerRadius}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100" step="5"
                                        value={imgCornerRadius}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setImgCornerRadius(val);
                                            onUpdateItemStyle((activeItem as any).customId || '', { cornerRadius: val });
                                        }}
                                        className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Border Width */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold opacity-70">Border Width</label>
                                        <span className="text-[10px] opacity-70">{imgBorderWidth}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="20" step="1"
                                        value={imgBorderWidth}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setImgBorderWidth(val);
                                            onUpdateItemStyle((activeItem as any).customId || '', { strokeWidth: val });
                                        }}
                                        className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Border Color */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-70">Border Color</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['transparent', '#ffffff', '#000000', '#4ade80', '#60a5fa', '#f472b6', '#facc15', '#fb923c'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => onUpdateItemStyle((activeItem as any).customId || '', { stroke: c === 'transparent' ? '' : c })}
                                                className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform ${c === 'transparent' ? 'bg-[repeating-conic-gradient(#ccc_0_25%,transparent_0_50%)] bg-[length:8px_8px]' : ''}`}
                                                style={{ backgroundColor: c === 'transparent' ? undefined : c }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Opacity */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold opacity-70">Opacity</label>
                                        <span className="text-[10px] opacity-70">{Math.round(imgOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.05"
                                        value={imgOpacity}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setImgOpacity(val);
                                            onUpdateItemStyle((activeItem as any).customId || '', { opacity: val });
                                        }}
                                        className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Photo Search */}
                        <form onSubmit={handleImageSearch} className="relative">
                            <input
                                type="text"
                                value={imageQuery}
                                onChange={(e) => setImageQuery(e.target.value)}
                                placeholder="Search Pexels..."
                                className="w-full bg-muted rounded-lg pl-10 pr-4 py-2 text-xs font-manrope focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                        </form>

                        {imagesLoading && (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                            </div>
                        )}

                        {!imagesLoading && (
                            <div className="grid grid-cols-2 gap-2">
                                {photos.map((photo) => (
                                    <button
                                        key={photo.id}
                                        onClick={() => handlePhotoClick(photo.src.large2x)}
                                        className="relative aspect-square rounded-md overflow-hidden hover:opacity-80 transition-opacity group"
                                    >
                                        <img src={photo.src.medium} alt={photo.alt} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[8px] text-white truncate">{photo.photographer}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!imagesLoading && photos.length === 0 && (
                            <p className="text-center text-xs opacity-50 py-4">No results found.</p>
                        )}
                    </div>
                );

            case "shapes":
                return (
                    <div className="space-y-6">
                        <h3 className="font-manrope font-bold text-sm">Shapes</h3>

                        {/* Basic Shapes */}
                        <div>
                            <label className="text-xs font-bold opacity-50 mb-3 block">BASIC SHAPES</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => onAddShape('rect', { fill: '#4ade80' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <Square className="w-8 h-8" />
                                    <span className="text-xs font-medium">Rectangle</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('circle', { fill: '#60a5fa' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <Circle className="w-8 h-8" />
                                    <span className="text-xs font-medium">Circle</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('triangle', { fill: '#f472b6' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12,2 22,20 2,20" />
                                    </svg>
                                    <span className="text-xs font-medium">Triangle</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('diamond', { fill: '#a78bfa' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12,2 22,12 12,22 2,12" />
                                    </svg>
                                    <span className="text-xs font-medium">Diamond</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('hexagon', { fill: '#facc15' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
                                    </svg>
                                    <span className="text-xs font-medium">Hexagon</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('star', { fill: '#fb923c' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12,2 15,9 22,9 17,14 19,22 12,17 5,22 7,14 2,9 9,9" />
                                    </svg>
                                    <span className="text-xs font-medium">Star</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('pentagon', { fill: '#2dd4bf' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12,2 22,9 19,21 5,21 2,9" />
                                    </svg>
                                    <span className="text-xs font-medium">Pentagon</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('octagon', { fill: '#f87171' })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7" />
                                    </svg>
                                    <span className="text-xs font-medium">Octagon</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('line', { stroke: '#ffffff', strokeWidth: 3 })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <Minus className="w-8 h-8" />
                                    <span className="text-xs font-medium">Line</span>
                                </button>
                            </div>
                        </div>

                        {/* Outlined Shapes */}
                        <div>
                            <label className="text-xs font-bold opacity-50 mb-3 block">OUTLINED</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => onAddShape('rect', { fill: 'transparent', stroke: '#ffffff', strokeWidth: 2 })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <Square className="w-8 h-8 stroke-2" strokeWidth={2} fill="none" />
                                    <span className="text-xs font-medium">Rect</span>
                                </button>
                                <button
                                    onClick={() => onAddShape('circle', { fill: 'transparent', stroke: '#ffffff', strokeWidth: 2 })}
                                    className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                >
                                    <Circle className="w-8 h-8 stroke-2" strokeWidth={2} fill="none" />
                                    <span className="text-xs font-medium">Circle</span>
                                </button>
                            </div>
                        </div>

                        {/* Color Presets */}
                        <div>
                            <label className="text-xs font-bold opacity-50 mb-3 block">COLOR PRESETS</label>
                            <div className="grid grid-cols-5 gap-2">
                                {['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#fb923c', '#a78bfa', '#f87171', '#2dd4bf', '#ffffff', '#000000'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onAddShape('rect', { fill: color })}
                                        className="w-10 h-10 rounded-lg border border-border/20 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        title={`Add ${color} rectangle`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Shape Properties for Selected */}
                        {activeItem && ['rect', 'circle', 'ellipse', 'line', 'polygon', 'path'].includes(activeItem.type) && (
                            <div className="space-y-4 pt-4 border-t border-border/10">
                                <h3 className="font-manrope font-bold text-xs opacity-50 uppercase tracking-wider">Shape Style</h3>

                                {/* Fill Color */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-70">Fill Color</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['transparent', '#ffffff', '#000000', '#4ade80', '#60a5fa', '#f472b6', '#facc15', '#fb923c', '#a78bfa', '#f87171'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => onUpdateItemStyle(activeItem.id, { fill: c })}
                                                className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform ${c === 'transparent' ? 'bg-[repeating-conic-gradient(#ccc_0_25%,transparent_0_50%)] bg-[length:8px_8px]' : ''}`}
                                                style={{ backgroundColor: c === 'transparent' ? undefined : c }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Stroke Color */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-70">Stroke Color</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['transparent', '#ffffff', '#000000', '#4ade80', '#60a5fa', '#f472b6', '#facc15', '#fb923c'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => onUpdateItemStyle(activeItem.id, { stroke: c === 'transparent' ? '' : c })}
                                                className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform ${c === 'transparent' ? 'bg-[repeating-conic-gradient(#ccc_0_25%,transparent_0_50%)] bg-[length:8px_8px]' : ''}`}
                                                style={{ backgroundColor: c === 'transparent' ? undefined : c }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Stroke Width */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold opacity-70">Stroke Width</label>
                                        <span className="text-[10px] opacity-70">{activeItem.strokeWidth || 0}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="20" step="1"
                                        value={activeItem.strokeWidth || 0}
                                        onChange={(e) => onUpdateItemStyle(activeItem.id, { strokeWidth: parseInt(e.target.value) })}
                                        className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Opacity */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold opacity-70">Opacity</label>
                                        <span className="text-[10px] opacity-70">{Math.round((activeItem.opacity || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.05"
                                        value={activeItem.opacity || 1}
                                        onChange={(e) => onUpdateItemStyle(activeItem.id, { opacity: parseFloat(e.target.value) })}
                                        className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "assets":
                return <AssetsTab onAddSvg={onAddSvg} />;

            case "ai":
                return (
                    <div className="space-y-6">
                        <h3 className="font-manrope font-bold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-lime-400" /> AI Chef</h3>

                        <div className="space-y-3">
                            <label className="text-xs font-bold opacity-70">Dish Name</label>
                            <input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. Spicy Chicken Burger"
                                className="w-full bg-muted border border-border/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                onClick={handleAiGenerate}
                                disabled={!prompt || isGenerating}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <RotateCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                {isGenerating ? "Cooking..." : "Generate Description"}
                            </button>
                        </div>

                        {aiResult && (
                            <div className="bg-muted p-4 rounded-lg border border-border/10">
                                <p className="text-xs font-manrope italic opacity-80 mb-3">"{aiResult}"</p>
                                <button
                                    onClick={() => onAddText('body', aiResult)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                                >
                                    + Add to Canvas
                                </button>
                            </div>
                        )}
                    </div>
                );

            case "design":
                return (
                    <div className="space-y-8 animate-in slide-in-from-left-5 duration-300">

                        <hr className="border-border/20" />

                        {/* Color Theme Section */}
                        <div className="space-y-4">
                            <h3 className="font-manrope font-bold text-xs opacity-50 uppercase tracking-wider">Color Theme</h3>
                            <div className="flex flex-col gap-3">
                                {[
                                    // Dark themes
                                    { name: "Midnight", colors: ["#0a0a0a", "#ffffff", "#a1a1aa", "#facc15"] },
                                    { name: "Noir", colors: ["#18181b", "#fafafa", "#71717a", "#4ade80"] },
                                    { name: "Graphite", colors: ["#1c1917", "#f5f5f4", "#a8a29e", "#f97316"] },
                                    { name: "Deep Ocean", colors: ["#0c1e2b", "#f8fafc", "#64748b", "#38bdf8"] },
                                    // Light themes
                                    { name: "Sunset", colors: ["#fffbeb", "#451a03", "#92400e", "#f59e0b"] },
                                    { name: "Blush", colors: ["#fff1f2", "#4c0519", "#9f1239", "#f43f5e"] },
                                    { name: "Sage", colors: ["#f0fdf4", "#14532d", "#166534", "#22c55e"] },
                                    { name: "Lavender", colors: ["#faf5ff", "#3b0764", "#6b21a8", "#a855f7"] },
                                    { name: "Cream", colors: ["#fef7ed", "#3c2415", "#78350f", "#ca8a04"] },
                                    // Neutral
                                    { name: "Clean", colors: ["#ffffff", "#09090b", "#52525b", "#18181b"] },
                                    { name: "Paper", colors: ["#f4f1ea", "#1a1a1a", "#57534e", "#292524"] },
                                ].map(theme => (
                                    <button
                                        key={theme.name}
                                        onClick={() => onUpdateTheme(theme.colors)}
                                        className="w-full bg-background border border-border/40 hover:border-border rounded-xl p-3 flex items-center justify-between transition-colors group"
                                    >
                                        <span className="font-manrope text-sm font-medium">{theme.name}</span>
                                        <div className="flex -space-x-2">
                                            {theme.colors.map((c, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full border border-white dark:border-zinc-800 ring-1 ring-black/5" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="border-border/20" />

                        {/* Texture Section */}
                        <div className="space-y-4">
                            <h3 className="font-manrope font-bold text-xs opacity-50 uppercase tracking-wider">Texture</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onUpdateTexture('none')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${activeTexture === 'none' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 border-transparent'}`}
                                >
                                    NONE
                                </button>
                                <button
                                    onClick={() => onUpdateTexture('grain')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${activeTexture === 'grain' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 border-transparent'}`}
                                >
                                    GRAIN
                                </button>
                                <button
                                    onClick={() => onUpdateTexture('paper')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${activeTexture === 'paper' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 border-transparent'}`}
                                >
                                    PAPER
                                </button>
                            </div>
                        </div>

                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={`bg-card md:border-r border-border shadow-2xl z-30 overflow-hidden transition-all duration-300 ease-in-out flex flex-col active-tool-panel 
            fixed md:relative left-0 right-0 bottom-[4rem] md:bottom-auto top-auto md:top-0 h-[60vh] md:h-auto border-t md:border-t-0 rounded-t-2xl md:rounded-none
            ${isOpen ? 'translate-y-0 opacity-100 md:w-80' : 'translate-y-full opacity-0 md:w-0 md:translate-y-0 md:opacity-0'}`}
        >
            <div className="w-full md:w-80 h-full overflow-y-auto p-6">
                {renderContent()}
            </div>
        </div>
    );
}

function RotateCw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
