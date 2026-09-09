"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "smokear:install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Registers the service worker and, on browsers that support it, offers an install banner. */
export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline fallback just won't be available — the app still works online.
      });
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      if (localStorage.getItem(DISMISSED_KEY)) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-border bg-background-elevated p-3 shadow-lg lg:bottom-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand font-display text-sm font-bold text-brand-foreground">
        S
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Instalá SmokeAR</p>
        <p className="text-xs text-foreground-muted">Acceso rápido desde tu pantalla de inicio.</p>
      </div>
      <Button size="sm" onClick={handleInstall}>
        <Download size={14} /> Instalar
      </Button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Cerrar"
        className="shrink-0 text-foreground-subtle hover:text-foreground"
      >
        <X size={16} />
      </button>
    </div>
  );
}
