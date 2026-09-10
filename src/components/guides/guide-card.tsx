import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Guide } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export function GuideCard({ guide, index = 0 }: { guide: Guide; index?: number }) {
  const t = useTranslations("labels.guideLevel");

  return (
    <Link href={`/guides/${guide.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-brand/50">
        <MediaPlaceholder label={guide.title} seed={index} className="h-32 w-full" />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <Badge className="w-fit">{t(guide.level)}</Badge>
          <p className="font-display text-sm font-semibold leading-snug group-hover:text-brand">
            {guide.title}
          </p>
          <p className="line-clamp-2 text-xs text-foreground-muted">{guide.summary}</p>
        </div>
      </Card>
    </Link>
  );
}
