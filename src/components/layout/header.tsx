import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { QuickSearchTrigger } from "@/components/layout/quick-search";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import type { ProfileRow } from "@/types/database";

export function Header({ profile }: { profile: ProfileRow | null }) {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <Link href="/" className="flex items-center gap-2 lg:hidden">
        <Logo iconOnly />
      </Link>

      <div className="hidden flex-1 justify-center lg:flex">
        <QuickSearchTrigger />
      </div>

      <Link
        href="/search"
        aria-label={t("searchAriaLabel")}
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground-muted lg:hidden"
      >
        <Search size={18} />
      </Link>

      <LanguageSwitcher />

      <div className="hidden items-center gap-2 lg:flex">
        {profile ? (
          <UserMenu profile={profile} />
        ) : (
          <>
            <Button href="/login" variant="ghost" size="sm">
              {t("login")}
            </Button>
            <Button href="/register" variant="primary" size="sm">
              {t("createAccount")}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
