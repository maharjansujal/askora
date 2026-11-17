import { ProfileStatsDto } from "../../public/types/profileDto";
import {
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Award,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Flame,
  Trophy,
} from "lucide-react";

interface ProfileStatsProps {
  stats: ProfileStatsDto;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  console.log(stats);

  const items = [
    {
      label: "Questions",
      value: stats.questionsAsked,
      icon: HelpCircle,
    },
    {
      label: "Answers",
      value: stats.answersGiven,
      icon: MessageSquare,
    },
    {
      label: "Accepted",
      value: stats.acceptedAnswers,
      icon: CheckCircle2,
      highlight: true,
    },
    {
      label: "Best answers",
      value: stats.bestAnswers,
      icon: Award,
      highlight: true,
    },
    {
      label: "Upvotes",
      value: stats.upvotesReceived,
      icon: ThumbsUp,
    },
    {
      label: "Downvotes",
      value: stats.downvotesReceived,
      icon: ThumbsDown,
    },
    {
      label: "Points earned",
      value: stats.pointsEarned,
      icon: TrendingUp,
    },
    {
      label: "Points spent",
      value: stats.pointsSpent,
      icon: TrendingDown,
    },
    {
      label: "Current streak",
      value: stats.currentStreak,
      icon: Flame,
      suffix: stats.currentStreak === 1 ? "day" : "days",
    },
    {
      label: "Longest streak",
      value: stats.longestStreak,
      icon: Trophy,
      suffix: stats.longestStreak === 1 ? "day" : "days",
    },
  ];

  return (
    <section className="mb-4 rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Stats
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <item.icon
                className={`size-3.5 ${item.highlight ? "text-accent" : ""}`}
              />
              <span>{item.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-bold tabular-nums ${
                  item.highlight ? "text-accent" : "text-foreground"
                }`}
              >
                {item.value}
              </span>
              {item.suffix && (
                <span className="text-[10px] text-muted-foreground">
                  {item.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
