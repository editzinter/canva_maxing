import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { importSPKI, exportJWK } from "jose";
import { WorkOS } from "@workos-inc/node";

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const http = httpRouter();


// ... (Public Key code remains) ...

http.route({
    path: "/workos-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const signature = request.headers.get("workos-signature");
        const secret = process.env.WORKOS_WEBHOOK_SECRET;

        if (!secret) {
            console.error("Missing WORKOS_WEBHOOK_SECRET");
            return new Response("Webhook Secret Missing", { status: 500 });
        }

        if (!signature) {
            return new Response("Missing Signature", { status: 401 });
        }

        const payload = await request.text();

        try {
            const event = await workos.webhooks.constructEvent({
                payload,
                sigHeader: signature,
                secret,
                tolerance: 90000 // Large tolerance to avoid clock skew issues in dev
            });

            if (event.event === "user.created" || event.event === "user.updated") {
                const user = event.data;
                // Prepend issuer to match OIDC tokenIdentifier format
                // Issuer must match what is in auth.config.ts and openid-configuration
                const issuer = "https://befitting-marten-33.convex.site";
                const tokenIdentifier = `${issuer}|${user.id}`;

                await ctx.runMutation(internal.users.syncFromWebhook, {
                    tokenIdentifier,
                    name: user.firstName + " " + user.lastName,
                    email: user.emailVerified ? user.email : undefined,
                    picture: user.profilePictureUrl || undefined,
                });
            } else if (event.event === "user.deleted") {
                const user = event.data;
                const issuer = "https://befitting-marten-33.convex.site";
                const tokenIdentifier = `${issuer}|${user.id}`;

                await ctx.runMutation(internal.users.deleteFromWebhook, {
                    tokenIdentifier,
                });
            }

            return new Response("OK", { status: 200 });
        } catch (e) {
            console.error("Webhook processing failed:", e);
            return new Response("Invalid Signature or Error", { status: 400 });
        }
    }),
});

// Public Key matching the Private Key in .env.local
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzmhkWYmaZvL6Tos8ukJr
224Gnr9NBZJ898jmZeh7/3d/y9yEdq0dAY4keq/n9dLnjf4EwVTQWCxodXG3kPfx
tDslrD5FbW9mlKZrTF9NXk2CIfK9RxUF3CiPRsX62Ne+oaUqDW6fos5EvZvIlSNj
dWf694VSw8oEhEzzKTumHMeQYVDV00g9598nEKC2k/fOxJm39cpRJWPh4ULHLisi
cLOatwvqk/lCGEkKoy6S+mo36qpR19oFH9AmAdg0Kjs7WCJtshjuLwxSdCT0xj8A
RiiN8UGeEyPtsAIpel8mlRtZdaWOt1fh3CX6hUlKxvh7QL4JTNUULZnLRecKleJR
aQIDAQAB
-----END PUBLIC KEY-----`;


http.route({
    path: "/.well-known/jwks.json",
    method: "GET",
    handler: httpAction(async () => {
        try {
            const publicKey = await importSPKI(PUBLIC_KEY_PEM, "RS256");
            const jwk = await exportJWK(publicKey);
            jwk.use = "sig";
            jwk.alg = "RS256";
            jwk.kid = "convex-auth-1"; // Matching what we might want to sign with, but standard usually fine

            return new Response(JSON.stringify({ keys: [jwk] }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (e) {
            console.error("Failed to serve JWK", e);
            return new Response("Internal Server Error", { status: 500 });
        }
    }),
});

http.route({
    path: "/.well-known/openid-configuration",
    method: "GET",
    handler: httpAction(async () => {
        return new Response(JSON.stringify({
            // This issuer must match what we put in auth.config.ts AND what we sign the token with
            issuer: "https://befitting-marten-33.convex.site",
            jwks_uri: "https://befitting-marten-33.convex.site/.well-known/jwks.json",
            response_types_supported: ["id_token"],
            subject_types_supported: ["public"],
            id_token_signing_alg_values_supported: ["RS256"],
        }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        });
    })
});

export default http;
