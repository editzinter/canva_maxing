"use server";
import { SignJWT, importPKCS8 } from "jose";
import { withAuth } from "@workos-inc/authkit-nextjs";

// Clean up the private key from env
const PRIVATE_KEY_PEM = (process.env.JWT_PRIVATE_KEY || "").replace(/\\n/g, "\n");

export async function getAccessToken() {
    const { user } = await withAuth();

    if (!user) {
        return null;
    }

    if (!PRIVATE_KEY_PEM) {
        console.error("Missing JWT_PRIVATE_KEY");
        return null;
    }

    try {
        const secret = await importPKCS8(PRIVATE_KEY_PEM, "RS256");

        // Mint a JWT compatible with Convex
        const jwt = await new SignJWT({
            name: user.firstName + " " + user.lastName,
            email: user.email,
            picture: user.profilePictureUrl,
        })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(process.env.CONVEX_SITE_URL!)
            .setAudience("convex")
            .setSubject(user.id)
            .setExpirationTime("1h")
            .sign(secret);

        return jwt;
    } catch (e) {
        console.error("Failed to mint JWT:", e);
        return null;
    }
}
