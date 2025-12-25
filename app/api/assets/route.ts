import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const thumbnailsDir = path.join(process.cwd(), 'public/assets/thumbnails');

        try {
            await fs.access(thumbnailsDir);
        } catch {
            return NextResponse.json({ files: [] });
        }

        const filesRaw = await fs.readdir(thumbnailsDir).catch(() => []);

        // 1. Process Existing Thumbnails (Legacy)
        const legacyFiles = filesRaw.filter(file => file.endsWith('.png'))
            .map(file => {
                const baseName = file.replace('.png', '');
                return {
                    name: baseName,
                    url: `/assets/svgs/${baseName}.svg`,
                    thumbnail: `/assets/thumbnails/${file}`,
                    label: baseName.split('_')[0].split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase())
                };
            });

        // 2. Process New Graphics (Direct SVGs)
        const graphicsDir = path.join(process.cwd(), 'public/assets/graphics');
        const graphicsRaw = await fs.readdir(graphicsDir).catch(() => []);

        const graphicFiles = graphicsRaw.filter(file => file.endsWith('.svg'))
            .map(file => {
                const baseName = file.replace('.svg', '');
                return {
                    name: baseName,
                    url: `/assets/graphics/${file}`,       // Self-referencing URL
                    thumbnail: `/assets/graphics/${file}`, // SVG can be its own thumbnail
                    label: baseName.split('_').join(' ').split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase())
                };
            });

        const files = [...legacyFiles, ...graphicFiles];

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Error reading assets directory:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}
