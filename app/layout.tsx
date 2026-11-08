import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://urban-voiceful.vercel.app"),
  title: { default: "UrbanVoice", template: "%s · UrbanVoice" },
  openGraph: {
    type: "website",
    siteName: "UrbanVoice",
    title: "UrbanVoice: report problems, track fixes",
    description: "Report problems in your neighbourhood on a map, follow every step, and watch the city respond.",
  },
  twitter: { card: "summary_large_image" },
  description:
    "Report problems in your neighbourhood, follow what others are raising, and watch the city respond.",
};

export const viewport: Viewport = {
  themeColor: "#1b8500",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
