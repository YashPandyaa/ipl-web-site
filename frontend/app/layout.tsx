import type { Metadata } from "next";
import { Inter, Anton, Space_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import QueryProvider from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "IPL Stats Universe 2008–2026 | Full-Stack Cricket Analytics",
  description: "Explore comprehensive IPL cricket statistics, player radar comparisons, interactive venue maps, and AI-powered match commentary across 19 seasons.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "IPL Stats Universe 2008–2026",
    description: "Comprehensive IPL cricket analytics, player comparator, venue maps, and historical leaderboards.",
    type: "website",
    siteName: "IPL Stats Universe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        suppressHydrationWarning
        className={`${inter.variable} ${anton.variable} ${spaceMono.variable} font-sans min-h-screen antialiased bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300`}
      >
        <AppProvider>
          <QueryProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </QueryProvider>
        </AppProvider>
      </body>
    </html>
  );
}


