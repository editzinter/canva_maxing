import type { Metadata } from "next";
import {
  Bebas_Neue,
  Manrope,
  Cinzel,
  Inter,
  Fredericka_the_Great,
  Bodoni_Moda,
  Prata,
  Cormorant_Garamond,
  DM_Serif_Display,
  Libre_Baskerville,
  Outfit,
  Tenor_Sans,
  Space_Grotesk,
  DM_Sans,
  Archivo,
  Syne,
  Italiana,
  Julius_Sans_One,
  Marcellus,
  Forum,
  Pinyon_Script,
  Mrs_Saint_Delafield,
  Alex_Brush
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TransitionProvider } from "./components/TransitionProvider";
import SmoothScrolling from "./components/SmoothScrolling";
import ConvexClientProvider from "./ConvexClientProvider";
import { AuthProvider } from "./AuthProvider";

// Existing
const bebasNeue = Bebas_Neue({ variable: "--font-bebas-neue", subsets: ["latin"], weight: "400" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fredericka = Fredericka_the_Great({ variable: "--font-fredericka", subsets: ["latin"], weight: "400", adjustFontFallback: false, display: 'swap', fallback: ['serif'] });

// New - Luxury Serif
const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"] });
const prata = Prata({ variable: "--font-prata", subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400" });
const libre = Libre_Baskerville({ variable: "--font-libre", subsets: ["latin"], weight: ["400", "700"] });

// New - Modern Sans
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const tenor = Tenor_Sans({ variable: "--font-tenor", subsets: ["latin"], weight: "400" });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });

// New - Display
const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const italiana = Italiana({ variable: "--font-italiana", subsets: ["latin"], weight: "400" });
const julius = Julius_Sans_One({ variable: "--font-julius", subsets: ["latin"], weight: "400" });
const marcellus = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400" });
const forum = Forum({ variable: "--font-forum", subsets: ["latin"], weight: "400" });

// New - Script
const pinyon = Pinyon_Script({ variable: "--font-pinyon", subsets: ["latin"], weight: "400" });
const mrsSaint = Mrs_Saint_Delafield({ variable: "--font-mrs-saint", subsets: ["latin"], weight: "400" });
const alex = Alex_Brush({ variable: "--font-alex", subsets: ["latin"], weight: "400" });

// Only loading the fonts we actually use in templates + UI
const allFonts = [
  bebasNeue, manrope, cinzel, inter, fredericka,
  bodoni, prata, cormorant, dmSerif, libre,
  outfit, tenor, space, dmSans, archivo,
  syne, italiana, julius, marcellus, forum,
  pinyon, mrsSaint, alex
];

export const metadata: Metadata = {
  title: "VANDSLAB | Transforming Ideas",
  description: "Portfolio Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${allFonts.map(f => f.variable).join(" ")} antialiased h-full`}
        suppressHydrationWarning
      >
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <filter id="wavy">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="20"
            />
          </filter>
        </svg>
        <AuthProvider>
          <ConvexClientProvider>
            <Providers>
              <SmoothScrolling>
                <TransitionProvider>{children}</TransitionProvider>
              </SmoothScrolling>
            </Providers>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
