import { useState } from 'react';

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

export interface PexelsPhoto {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    alt: string;
}

export function usePexels() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);

    const searchPhotos = async (query: string) => {
        if (!query.trim()) return;
        if (!PEXELS_API_KEY) {
            setError("API Key missing");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12`, {
                headers: {
                    Authorization: PEXELS_API_KEY
                }
            });

            if (!res.ok) throw new Error("Failed to fetch images");

            const data = await res.json();
            setPhotos(data.photos || []);
        } catch (err) {
            setError("Failed to search images");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, photos, searchPhotos };
}
