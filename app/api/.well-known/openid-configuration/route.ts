import { NextResponse } from 'next/server';

// OpenID Connect Discovery Document
// Convex fetches this to find the JWKS endpoint
export async function GET(request: Request) {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const issuer = `${protocol}://${host}`;

    return NextResponse.json({
        issuer,
        jwks_uri: `${issuer}/api/.well-known/jwks.json`,
        authorization_endpoint: `${issuer}/api/auth/login`,
        token_endpoint: `${issuer}/api/auth/token`,
        response_types_supported: ['code', 'token', 'id_token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
