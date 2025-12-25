import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
    redirectUri: process.env.WORKOS_REDIRECT_URI,
});

export const config = {
    // More precise matcher:
    // - Excludes static files, images, favicon
    // - Excludes public assets
    // - Only runs on routes that may need auth context
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)',
    ],
};
