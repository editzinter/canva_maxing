import { Hero } from "./components/Hero";
import { Footer } from "./components/Footer";
import { Contact } from "./components/Contact";
import { About } from "./components/About";
import { WhatWeDo } from "./components/WhatWeDo";

import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function Home() {
  const { user } = await withAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero user={user} />
      <About />
      <WhatWeDo />
      <Contact />
      <Footer />
    </main>
  );
}
