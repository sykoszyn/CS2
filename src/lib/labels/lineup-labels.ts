import type { Lineup } from "@/types/content";
import type { ClickTypeEnum, ThrowTechniqueEnum } from "@/types/database";

/**
 * Enum value lists for building <select> options — the display labels
 * themselves live in messages/*.json under "labels.*" and are resolved at
 * render time via useTranslations, so they follow the active locale.
 */
export const grenadeTypeValues: Lineup["grenadeType"][] = ["smoke", "flash", "molotov", "he", "decoy"];
export const sideValues: Lineup["side"][] = ["ct", "t", "both"];
export const situationValues: Lineup["situation"][] = [
  "attack",
  "defense",
  "retake",
  "execute",
  "anti-eco",
  "default",
];
export const distanceValues: Lineup["distance"][] = ["close", "medium", "long"];
export const clickTypeValues: ClickTypeEnum[] = ["left", "right", "hold"];
export const throwTechniqueValues: ThrowTechniqueEnum[] = ["normal", "jumpthrow", "walkthrow", "crouch"];
