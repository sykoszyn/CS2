import type { Guide } from "@/types/content";

/** No guides published yet — guides aren't DB-backed yet, so this is the real state until content is added. */
export const guides: Guide[] = [];

export function getGuideBySlug(slug: string) {
  return guides.find((g) => g.slug === slug);
}
