import type { Video } from "@/types/content";

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function VideoEmbed({ video }: { video: Video }) {
  if (video.source === "youtube") {
    const embedUrl = getYoutubeEmbedUrl(video.url);
    if (embedUrl) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
          <iframe
            src={embedUrl}
            title="Video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (video.source === "mp4") {
    return (
      <video controls className="aspect-video w-full rounded-lg border border-border bg-black">
        <source src={video.url} type="video/mp4" />
      </video>
    );
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex aspect-video w-full items-center justify-center rounded-lg border border-border bg-background-elevated text-sm text-brand hover:underline"
    >
      Ver video externo →
    </a>
  );
}
