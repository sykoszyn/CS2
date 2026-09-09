import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${siteConfig.name} — Aprendé Counter-Strike 2`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: siteConfig.locale,
    background_color: "#0b0d10",
    theme_color: "#0b0d10",
    categories: ["games", "sports", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Lineups", url: "/lineups" },
      { name: "Mapas", url: "/maps" },
      { name: "Feed", url: "/feed" },
      { name: "Buscar", url: "/search" },
    ],
    // Used by the browser's install UI and by Play Store's "rich install"
    // card when the app is published there via TWA (see docs/app-stores.md).
    screenshots: [
      {
        src: "/screenshots/mobile-home.png",
        sizes: "824x1830",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshots/mobile-lineups.png",
        sizes: "824x1830",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshots/desktop-home.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
