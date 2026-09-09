import type { Boost } from "@/types/content";

export const boostCategoryLabels: Record<Boost["category"], string> = {
  common: "Común",
  competitive: "Competitivo",
  exotic: "Exótico",
  secret: "Secreto",
};

export const boostCategoryOptions = Object.entries(boostCategoryLabels).map(([value, label]) => ({
  value: value as Boost["category"],
  label,
}));
