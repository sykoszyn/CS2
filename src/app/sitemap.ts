import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { maps } from "@/lib/mock/maps";
import { lineups } from "@/lib/mock/lineups";
import { guides } from "@/lib/mock/guides";
import { boosts } from "@/lib/mock/boosts";
import { plays } from "@/lib/mock/plays";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/maps", "/lineups", "/guides", "/boosts", "/plays", "/feed", "/search"].map(
    (path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
    }),
  );

  const mapRoutes = maps.map((m) => ({ url: `${siteConfig.url}/maps/${m.slug}`, lastModified: new Date() }));
  const lineupRoutes = lineups.map((l) => ({
    url: `${siteConfig.url}/lineups/${l.slug}`,
    lastModified: l.createdAt,
  }));
  const guideRoutes = guides.map((g) => ({
    url: `${siteConfig.url}/guides/${g.slug}`,
    lastModified: g.createdAt,
  }));
  const boostRoutes = boosts.map((b) => ({ url: `${siteConfig.url}/boosts/${b.slug}` }));
  const playRoutes = plays.map((p) => ({
    url: `${siteConfig.url}/plays/${p.slug}`,
    lastModified: p.createdAt,
  }));

  return [...staticRoutes, ...mapRoutes, ...lineupRoutes, ...guideRoutes, ...boostRoutes, ...playRoutes];
}
