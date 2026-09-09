import type { Play } from "@/types/content";

export const playCategoryLabels: Record<Play["category"], string> = {
  clutch: "Clutch",
  ace: "Ace",
  entry: "Entry",
  retake: "Retake",
  "ninja-defuse": "Ninja Defuse",
  wallbang: "Wallbang",
  outplay: "Outplay",
  pro: "Pro",
};

export const playCategoryOptions = Object.entries(playCategoryLabels).map(([value, label]) => ({
  value: value as Play["category"],
  label,
}));
