import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto",
});

const robotoCondensed = Roboto_Condensed({
  weight: ["300", "400", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto-condensed",
});

export const metadata: Metadata = {
  title: "Central Dispatch | The Auto Industry's Vehicle Transport Marketplace",
  description: "Central Dispatch | The Auto Industry's Vehicle Transport Marketplace",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoCondensed.variable} antialiased`}>
        {/* Минимальный дисклеймер - тестовая среда */}
        <div style={{
          position: 'fixed',
          bottom: '2px',
          right: '2px',
          fontSize: '8px',
          color: '#999',
          opacity: 0.5,
          zIndex: 9999,
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          TEST ENV
        </div>
        {children}
      </body>
    </html>
  );
}

