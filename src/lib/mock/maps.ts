import type { GameMap, MapZone } from "@/types/content";

/**
 * Demo map catalog. In production this table is `maps` in Supabase —
 * maps are never hardcoded in the app, this file only exists so the
 * UI has something to render before the DB is seeded (see section 35).
 */
export const maps: GameMap[] = [
  {
    id: "map_mirage",
    slug: "mirage",
    name: "Mirage",
    description:
      "Mapa de mid-control clásico. Dos bombsites conectados por Mid, con Window y Connector como puntos clave de información.",
    imageUrl: "/maps/mirage/overview.jpg",
    thumbnailUrl: "/maps/mirage/thumb.jpg",
    radarUrl: "/radars/mirage.png",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
  {
    id: "map_inferno",
    slug: "inferno",
    name: "Inferno",
    description:
      "Mapa angosto y vertical con Banana como eje central de rotaciones hacia B site.",
    imageUrl: "/maps/inferno/overview.jpg",
    thumbnailUrl: "/maps/inferno/thumb.jpg",
    radarUrl: "/radars/inferno.png",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
  {
    id: "map_nuke",
    slug: "nuke",
    name: "Nuke",
    description: "Mapa vertical de dos plantas, con Rafters y Ramp como zonas críticas de A site.",
    imageUrl: "/maps/nuke/overview.jpg",
    thumbnailUrl: "/maps/nuke/thumb.jpg",
    radarUrl: "/radars/nuke-upper.png",
    radarUrlLower: "/radars/nuke-lower.png",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
  {
    id: "map_ancient",
    slug: "ancient",
    name: "Ancient",
    description: "Mapa de jungla con líneas de vista cortas y mucho juego de utility en Mid.",
    imageUrl: "/maps/ancient/overview.jpg",
    thumbnailUrl: "/maps/ancient/thumb.jpg",
    radarUrl: "/radars/ancient.png",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
  {
    id: "map_anubis",
    slug: "anubis",
    name: "Anubis",
    description: "Mapa con canales de agua y Mid dividido, favorece ejecuciones coordinadas.",
    imageUrl: "/maps/anubis/overview.jpg",
    thumbnailUrl: "/maps/anubis/thumb.jpg",
    radarUrl: "/radars/anubis.png",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
  {
    id: "map_vertigo",
    slug: "vertigo",
    name: "Vertigo",
    description: "Mapa vertical en altura, con B site abierto y A site denso en cobertura.",
    imageUrl: "/maps/vertigo/overview.jpg",
    thumbnailUrl: "/maps/vertigo/thumb.jpg",
    radarUrl: "/radars/vertigo-upper.png",
    radarUrlLower: "/radars/vertigo-lower.png",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
  {
    id: "map_dust2",
    slug: "dust2",
    name: "Dust II",
    description: "El mapa más icónico de la serie. Long A y Tunnels B definen el ritmo del juego.",
    imageUrl: "/maps/dust2/overview.jpg",
    thumbnailUrl: "/maps/dust2/thumb.jpg",
    radarUrl: "/radars/dust2.png",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
  {
    id: "map_overpass",
    slug: "overpass",
    name: "Overpass",
    description: "Mapa técnico con Bathrooms y Monster como zonas de alto tráfico de utility.",
    imageUrl: "/maps/overpass/overview.jpg",
    thumbnailUrl: "/maps/overpass/thumb.jpg",
    radarUrl: "/radars/overpass.webp",
    version: "CS2",
    active: true,
    bombsites: ["A", "B"],
  },
];

export function getMapBySlug(slug: string) {
  return maps.find((m) => m.slug === slug);
}

/** A handful of demo callouts for Mirage — enough to demonstrate the map-zones UI (section 5). */
export const mapZones: Record<string, MapZone[]> = {
  mirage: [
    {
      id: "zone_mirage_window",
      mapId: "map_mirage",
      name: "Window",
      aliases: ["Ventana"],
      description: "Ventana que conecta Mid con A site, punto clave de información y utility.",
      x: 42,
      y: 38,
    },
    {
      id: "zone_mirage_jungle",
      mapId: "map_mirage",
      name: "Jungle",
      aliases: ["Palm", "Palmeras"],
      description: "Zona de vegetación en A site usada para flancos y retakes.",
      x: 58,
      y: 30,
    },
    {
      id: "zone_mirage_connector",
      mapId: "map_mirage",
      name: "Connector",
      aliases: ["Con"],
      description: "Pasillo que conecta Mid con B Apps.",
      x: 35,
      y: 55,
    },
    {
      id: "zone_mirage_ticket",
      mapId: "map_mirage",
      name: "Ticket Booth",
      aliases: ["Ticket", "TB"],
      description: "Estructura en Mid usada como cover durante peeks.",
      x: 40,
      y: 60,
    },
    {
      id: "zone_mirage_stairs",
      mapId: "map_mirage",
      name: "Stairs",
      aliases: ["Escaleras"],
      description: "Escaleras de acceso a B site desde Apps.",
      x: 25,
      y: 45,
    },
  ],
};
