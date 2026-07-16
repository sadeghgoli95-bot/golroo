import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Golroo",
    short_name: "Golroo",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EE",
    theme_color: "#6B2D3E",
    icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
