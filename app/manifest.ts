import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Golroo",
    short_name: "Golroo",
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#6C1F33",
    icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
