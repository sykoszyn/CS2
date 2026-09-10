"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Trash2 } from "lucide-react";
import { postCommentAction, deleteCommentAction } from "@/lib/comments/actions";
import { formatRelativeDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import type { CommentWithAuthor } from "@/types/content";
import type { ContentTypeEnum } from "@/types/database";

export function CommentSection({
  contentType,
  contentId,
  comments,
  isLoggedIn,
}: {
  contentType: ContentTypeEnum;
  contentId: string;
  comments: CommentWithAuthor[];
  isLoggedIn: boolean;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("comments");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await postCommentAction(contentType, contentId, text, pathname);
      if (result.status === "error") {
        setError(result.message);
      } else {
        setText("");
        router.refresh();
      }
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteCommentAction(commentId, pathname);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">{t("title", { count: comments.length })}</h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("placeholder")}
            rows={3}
            maxLength={2000}
            className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none focus-visible:border-brand"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" size="sm" disabled={pending || !text.trim()}>
            {pending ? t("publishing") : t("submit")}
          </Button>
        </form>
      ) : (
        <Button href={`/login?next=${pathname}`} variant="secondary" size="sm">
          {t("loginToComment")}
        </Button>
      )}

      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm text-foreground-subtle">{t("empty")}</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-md border border-border bg-background-card p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                @{comment.authorUsername}{" "}
                <span className="text-xs font-normal text-foreground-subtle">
                  {formatRelativeDate(comment.createdAt)}
                </span>
              </p>
              {comment.isOwn && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  aria-label={t("deleteAriaLabel")}
                  className="text-foreground-subtle hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-foreground-muted">{comment.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
