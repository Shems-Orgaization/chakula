
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Chakula — Less deciding. More eating.",
  description:
    "A practical Kenyan food decision app for affordable meals, pantry matches and everyday cooking.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#17251D" },
  ],
};

// This runs BEFORE the page paints — no flash of wrong theme, ever.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('food-theme');
    var theme;

    if (stored === '"dark"' || stored === 'dark') {
      theme = 'dark';
    } else if (stored === '"light"' || stored === 'light') {
      theme = 'light';
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Native inline script — runs synchronously before paint */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
