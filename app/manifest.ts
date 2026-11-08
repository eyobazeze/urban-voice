import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UrbanVoice",
    short_name: "UrbanVoice",
    description: "Report problems in your neighbourhood and watch the city respond.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f2",
    theme_color: "#1b8500",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
