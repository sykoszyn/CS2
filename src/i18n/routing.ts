import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en", "fr", "pt"],
  defaultLocale: "es",
});

export type AppLocale = (typeof routing.locales)[number];
