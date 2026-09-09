import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-6 pb-24 text-xs text-foreground-subtle lg:px-6 lg:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}. Hecho por la comunidad de CS2.
        </span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacidad
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Términos
          </Link>
        </div>
      </div>
    </footer>
  );
}
