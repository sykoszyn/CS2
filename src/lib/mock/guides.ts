import type { Guide } from "@/types/content";

export const guides: Guide[] = [
  {
    id: "guide_mirage_beginner",
    slug: "mirage-desde-cero",
    title: "Mirage desde cero",
    summary: "Todo lo que necesitás saber para jugar Mirage por primera vez a nivel competitivo.",
    mapSlug: "mirage",
    level: "beginner",
    authorUsername: "demo_coach",
    coverImageUrl: "/guides/mirage-desde-cero/cover.jpg",
    sections: [
      { order: 1, title: "Callouts básicos", content: "Aprendé los callouts esenciales: Window, Jungle, Connector, Ticket, Stairs..." },
      { order: 2, title: "Economía de ronda", content: "Cómo administrar tu utility en las primeras rondas." },
      { order: 3, title: "Ejecuciones básicas de A y B", content: "Introducción a los executes más simples de ejecutar en equipo." },
    ],
    createdAt: "2026-01-05T10:00:00Z",
    isDemo: true,
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((g) => g.slug === slug);
}
