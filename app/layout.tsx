import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "UrbanVoice", template: "%s · UrbanVoice" },
  description:
    "Report problems in your neighbourhood, follow what others are raising, and watch the city respond.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#249a00",
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
