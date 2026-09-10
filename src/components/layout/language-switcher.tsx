"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        className="flex h-10 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm text-foreground-muted hover:bg-background-elevated"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-background-elevated py-1 shadow-xl">
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => {
                setOpen(false);
                router.replace(pathname, { locale: l });
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-background-card ${
                l === locale ? "text-brand" : "text-foreground"
              }`}
            >
              {t(l)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
