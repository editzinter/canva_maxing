import { NextResponse } from 'next/server';
import { importSPKI, exportJWK } from 'jose';

// Fresh RSA public key matching the private key in auth.ts
const PUBLIC_KEY_PEM = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmxUI0TE4dX4iIVTyyJdv\nXMhrkHKc/BlKmRBdx+7L/PQkFes7lyYmhOJB+ucyTq2wieSEd8+pXRXI+HDqsZv2\nIO89Iov0yWxwOcOf/TGbc9Pess0GSahU6OL8x5/xCr9NW0vyzAgvLcO93vveObg1\nBHK7BrjPbQ2IQdNcsJcBPklsorW3oXAc6lgEaLJO9+ZMt/LYc06UEbz9hn8iDHF9\nIn0548f1UEo76rU2kCcIKKkso78PIUHu7heBrwV/VsvHxUI/lRsiUxzXRT3s/WwC\nJpMAuQPFf6xpz1JE8qDmpVykNbAE7G4y4eTinCIGvcCgz9gRQWCUXbPT3RuJHBzG\nFwIDAQAB\n-----END PUBLIC KEY-----\n";

export async function GET() {
    try {
        const publicKey = await importSPKI(PUBLIC_KEY_PEM, 'RS256');
        const jwk = await exportJWK(publicKey);

        const jwkWithMetadata = {
            ...jwk,
            kid: 'limits-key-2',
            alg: 'RS256',
            use: 'sig',
        };

        return NextResponse.json({
            keys: [jwkWithMetadata],
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Failed to generate JWKS:', error);
        return NextResponse.json({ error: 'Failed to generate JWKS' }, { status: 500 });
    }
}
