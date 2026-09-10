"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, X } from "lucide-react";
import { quickSearchAction } from "@/lib/search/actions";
import type { SearchResult } from "@/services/search.service";
import { cn } from "@/lib/utils/cn";

export function QuickSearchTrigger() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("quickSearch");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-sm items-center gap-2 rounded-md border border-border bg-background-elevated px-3 text-sm text-foreground-subtle transition-colors hover:border-border-strong"
      >
        <Search size={16} />
        <span className="flex-1 text-left">{t("trigger")}</span>
        <kbd className="hidden rounded border border-border-strong px-1.5 py-0.5 text-[10px] sm:inline">
          {t("shortcut")}
        </kbd>
      </button>
      {open && <QuickSearchModal onClose={() => setOpen(false)} />}
    </>
  );
}

function QuickSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [fetchedResults, setFetchedResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const router = useRouter();
  const t = useTranslations("quickSearch");
  const results = query.trim() ? fetchedResults : [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    const currentRequest = ++requestId.current;
    const timeout = setTimeout(() => {
      quickSearchAction(q).then((found) => {
        // Ignore stale responses from a previous, since-superseded keystroke.
        if (currentRequest === requestId.current) setFetchedResults(found);
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-fade-in rounded-lg border border-border bg-background-elevated shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search size={16} className="text-foreground-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
          />
          <button onClick={onClose} aria-label={t("closeAriaLabel")} className="text-foreground-subtle hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {query && results.length === 0 && (
            <p className="p-4 text-sm text-foreground-muted">{t("noResults", { query })}</p>
          )}
          {results.map((r) => (
            <button
              key={`${r.type}-${r.href}`}
              onClick={() => goTo(r.href)}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-background-card",
              )}
            >
              <span>{r.title}</span>
              <span className="text-xs text-foreground-subtle">{t(`types.${r.type}`)}</span>
            </button>
          ))}
          {!query && <p className="p-4 text-xs text-foreground-subtle">{t("hint")}</p>}
        </div>
      </div>
    </div>
  );
}
