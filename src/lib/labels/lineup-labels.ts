import type { Lineup } from "@/types/content";
import type { ClickTypeEnum } from "@/types/database";

export const grenadeTypeLabels: Record<Lineup["grenadeType"], string> = {
  smoke: "Smoke",
  flash: "Flash",
  molotov: "Molotov",
  he: "HE",
  decoy: "Decoy",
};

export const sideLabels: Record<Lineup["side"], string> = {
  ct: "CT",
  t: "T",
  both: "Ambos",
};

export const situationLabels: Record<Lineup["situation"], string> = {
  attack: "Ataque",
  defense: "Defensa",
  retake: "Retake",
  execute: "Execute",
  "anti-eco": "Anti-eco",
  default: "Default",
};

export const distanceLabels: Record<Lineup["distance"], string> = {
  close: "Cerca",
  medium: "Media",
  long: "Larga",
};

export const clickTypeLabels: Record<ClickTypeEnum, string> = {
  left: "Click izquierdo",
  right: "Click derecho",
  hold: "Mantener",
};

function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return Object.entries(labels).map(([value, label]) => ({ value: value as T, label: label as string }));
}

export const grenadeTypeOptions = toOptions(grenadeTypeLabels);
export const sideOptions = toOptions(sideLabels);
export const situationOptions = toOptions(situationLabels);
export const distanceOptions = toOptions(distanceLabels);
export const clickTypeOptions = toOptions(clickTypeLabels);
