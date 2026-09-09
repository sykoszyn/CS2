import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { guides } from "@/lib/mock/guides";
import { getMaps } from "@/services/maps.service";
import { getLineups } from "@/services/lineups.service";
import { getBoosts } from "@/services/boosts.service";
import { getPlays } from "@/services/plays.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [maps, lineups, boosts, plays] = await Promise.all([
    getMaps(),
    getLineups(),
    getBoosts(),
    getPlays(),
  ]);

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
