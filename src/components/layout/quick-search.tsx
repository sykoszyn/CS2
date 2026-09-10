"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, X, Clock } from "lucide-react";
import { quickSearchAction } from "@/lib/search/actions";
import type { SearchResult, SearchResultType } from "@/services/search.service";
import { cn } from "@/lib/utils/cn";

const RECENT_KEY = "smokear:recent-searches";
const RECENT_LIMIT = 5;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const current = loadRecent().filter((q) => q.toLowerCase() !== query.toLowerCase());
  const next = [query, ...current].slice(0, RECENT_LIMIT);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function QuickSearchTrigger({ variant = "compact" }: { variant?: "compact" | "hero" }) {
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

  if (variant === "hero") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="group flex h-14 w-full items-center gap-3 rounded-full border border-border-strong bg-background-card/90 px-5 text-base shadow-xl shadow-black/30 backdrop-blur transition-all hover:border-brand/50"
        >
          <Search size={20} className="text-brand" />
          <span className="flex-1 text-left text-foreground-subtle">{t("heroPlaceholder")}</span>
          <kbd className="hidden rounded-full border border-border-strong px-2.5 py-1 text-xs font-medium text-foreground-subtle sm:inline">
            {t("shortcut")}
          </kbd>
        </button>
        {open && <QuickSearchModal onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex h-11 w-full max-w-md items-center gap-2.5 rounded-full border border-border bg-background-card px-4 text-sm text-foreground-subtle shadow-sm transition-all hover:border-brand/40 hover:shadow-brand/10"
      >
        <Search size={16} className="text-foreground-subtle transition-colors group-hover:text-brand" />
        <span className="flex-1 text-left">{t("trigger")}</span>
        <kbd className="hidden rounded-full border border-border-strong px-2 py-0.5 text-[10px] font-medium sm:inline">
          {t("shortcut")}
        </kbd>
      </button>
      {open && <QuickSearchModal onClose={() => setOpen(false)} />}
    </>
  );
}

const TYPE_ORDER: SearchResultType[] = ["lineup", "map", "boost", "play", "guide"];

function QuickSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [fetchedResults, setFetchedResults] = useState<SearchResult[]>([]);
  const [recent] = useState<string[]>(() => loadRecent());
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const router = useRouter();
  const t = useTranslations("quickSearch");
  const results = useMemo(() => (query.trim() ? fetchedResults : []), [query, fetchedResults]);

  const grouped = useMemo(() => {
    const groups = new Map<SearchResultType, SearchResult[]>();
    for (const r of results) {
      groups.set(r.type, [...(groups.get(r.type) ?? []), r]);
    }
    return TYPE_ORDER.map((type) => ({ type, items: groups.get(type) ?? [] })).filter((g) => g.items.length > 0);
  }, [results]);

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
    if (query.trim()) saveRecent(query.trim());
    onClose();
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-20 sm:pt-28" onClick={onClose}>
      <div
        className="w-full max-w-xl animate-scale-in overflow-hidden rounded-xl border border-border-strong bg-background-elevated shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={18} className="text-brand" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-foreground-subtle"
          />
          <button onClick={onClose} aria-label={t("closeAriaLabel")} className="text-foreground-subtle hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {query && results.length === 0 && (
            <p className="p-6 text-center text-sm text-foreground-muted">{t("noResults", { query })}</p>
          )}

          {!query && recent.length > 0 && (
            <div className="p-2">
              <p className="text-eyebrow px-3 py-2">{t("recentSearches")}</p>
              {recent.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground-muted hover:bg-background-card hover:text-foreground"
                >
                  <Clock size={14} className="text-foreground-subtle" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.type} className="p-2">
              <p className="text-eyebrow px-3 py-2">{t(`types.${group.type}`)}</p>
              {group.items.map((r) => (
                <button
                  key={`${r.type}-${r.href}`}
                  onClick={() => goTo(r.href)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm hover:bg-background-card",
                  )}
                >
                  <span className="text-foreground">{r.title}</span>
                  {r.mapSlug && <span className="text-xs capitalize text-foreground-subtle">{r.mapSlug}</span>}
                </button>
              ))}
            </div>
          ))}

          {!query && recent.length === 0 && <p className="p-6 text-center text-xs text-foreground-subtle">{t("hint")}</p>}
        </div>
      </div>
    </div>
  );
}
