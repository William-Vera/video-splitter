import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://clipslice.app"),

  title: {
    default: "Split Video Online Free",
    template: "%s | ClipSlice",
  },

  description:
    "Split videos online for WhatsApp, TikTok, Instagram and YouTube Shorts directly in your browser.",

  keywords: [
    "split video online",
    "video splitter",
    "cut video online",
    "split video free",
    "dividir video whatsapp",
  ],

  openGraph: {
    title: "ClipSlice",
    description: "Free online video splitter",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}