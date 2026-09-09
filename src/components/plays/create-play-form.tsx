"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createPlayAction, type CreatePlayInput } from "@/lib/plays/actions";
import type { GameMap } from "@/types/content";
import { playCategoryOptions } from "@/lib/labels/play-labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const selectClass =
  "h-10 w-full rounded-md border border-border bg-background-elevated px-3 text-sm text-foreground outline-none focus-visible:border-brand";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground-muted";

export function CreatePlayForm({ maps }: { maps: GameMap[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [mapId, setMapId] = useState(maps[0]?.id ?? "");
  const [category, setCategory] = useState(playCategoryOptions[0].value);
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const input: CreatePlayInput = {
      title,
      mapId,
      category,
      description,
      videoUrl,
      videoSource: "youtube",
    };

    startTransition(async () => {
      const result = await createPlayAction(input);
      if (result?.status === "error") setError(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Título</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ace en retake de B site" required />
        </div>

        <div>
          <label className={labelClass}>Mapa</label>
          <select className={selectClass} value={mapId} onChange={(e) => setMapId(e.target.value)} required>
            {maps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <select
            className={selectClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
          >
            {playCategoryOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Descripción</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá cómo pasó la jugada"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Video (YouTube)</label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </div>
      </div>

      {error && <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Publicando..." : "Publicar jugada"}
      </Button>
    </form>
  );
}
