import { CheckCircle2, ChevronRight } from "lucide-react";
import { NextRankDto } from "../../public/types/profileDto";

interface RankProgressProps {
  currentRankName: string;
  nextRank: NextRankDto | null;
}

export function RankProgress({ currentRankName, nextRank }: RankProgressProps) {
  if (!nextRank) {
    return (
      <section className="mb-4 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Rank progression
        </h2>
        <p className="text-sm text-foreground">
          You've reached the highest rank. Nice work.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-4 rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Rank progression
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">
            {currentRankName}
          </span>
          <ChevronRight className="size-3.5 text-muted-foreground" />
          <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-muted-foreground">
            {nextRank.name}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {nextRank.requirements.map((req) => {
          const percent = Math.min(
            100,
            Math.round((req.current / req.required) * 100),
          );
          const remaining = Math.max(0, req.required - req.current);

          return (
            <div key={req.type}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  {req.met && (
                    <CheckCircle2 className="size-3.5 text-success" />
                  )}
                  {req.label}
                </span>
                <span
                  className={
                    req.met
                      ? "font-medium text-success tabular-nums"
                      : "text-muted-foreground tabular-nums"
                  }
                >
                  {req.current} / {req.required}
                  {!req.met && remaining > 0 && (
                    <span className="ml-1 text-[10px]">
                      ({remaining} to go)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    req.met ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
