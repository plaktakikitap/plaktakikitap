import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Serif_4, DM_Sans, Cinzel, Inter, Caveat, Permanent_Marker } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { MainWrapper } from "@/components/layout/MainWrapper";
import { MotionLayout } from "@/components/layout/MotionLayout";
import SiteBackground from "@/components/SiteBackground";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-handwriting-title",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "plaktakikitap — Film, Kitap, Proje Koleksiyonu",
  description: "Kişisel film, dizi, kitap ve proje koleksiyonum",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${cormorant.variable} ${sourceSerif.variable} ${dmSans.variable} ${cinzel.variable} ${inter.variable} ${caveat.variable} ${permanentMarker.variable} min-h-screen antialiased`}
      >
        <SiteBackground />
        <Nav />
        <MainWrapper>
          <MotionLayout>{children}</MotionLayout>
        </MainWrapper>
      </body>
    </html>
  );
}
