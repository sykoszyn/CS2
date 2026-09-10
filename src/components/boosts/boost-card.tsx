import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Users } from "lucide-react";
import type { Boost } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { DifficultyDots } from "@/components/ui/difficulty-dots";

export function BoostCard({ boost, index = 0 }: { boost: Boost; index?: number }) {
  const t = useTranslations("labels.boostCategory");

  return (
    <Link href={`/boosts/${boost.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-brand/50">
        <MediaPlaceholder label={boost.location} seed={index} className="h-36 w-full" />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="font-display text-sm font-semibold leading-snug group-hover:text-brand">
            {boost.name}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="brand">{t(boost.category)}</Badge>
            <Badge className="gap-1">
              <Users size={12} /> {boost.playersRequired}
            </Badge>
          </div>
          <div className="mt-auto pt-1">
            <DifficultyDots value={boost.difficulty} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
