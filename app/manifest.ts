import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EE",
    theme_color: "#6B2D3E",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
