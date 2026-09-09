import { cn } from "@/lib/utils/cn";

export function DifficultyDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Dificultad ${value} de ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < value ? "bg-brand" : "bg-border-strong",
          )}
        />
      ))}
    </div>
  );
}
