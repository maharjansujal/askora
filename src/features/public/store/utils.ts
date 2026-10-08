import { RankRequirementType, UserStat } from "@/src/db/schema";

export const labelForRequirement = (type: RankRequirementType): string => {
  switch (type) {
    case "POINTS_EARNED":
      return "Points earned";
    case "ANSWERS":
      return "Answers";
    case "ACCEPTED_ANSWERS":
      return "Accepted answers";
    case "BEST_ANSWERS":
      return "Best answers";
    case "UPVOTES_RECEIVED":
      return "Upvotes received";
  }
};

export const statsFor = (type: string, stats: UserStat) => {
  switch (type) {
    case "POINTS_EARNED":
      return stats.pointsEarned;
    case "ANSWERS":
      return stats.answersGiven;
    case "ACCEPTED_ANSWERS":
      return stats.acceptedAnswers;
    case "BEST_ANSWERS":
      return stats.bestAnswers;
    case "UPVOTES_RECEIVED":
      return stats.upvotesReceived;
    default:
      return 0;
  }
};

export const prepareUpdatePayload = (frontendData: FormData) => {
  let obj = Object.fromEntries(frontendData);
  let returnObj = {} as typeof obj;
  for (let i in obj) {
    if (obj[i] !== "") {
      returnObj[i] = obj[i];
    }
  }
  return returnObj;
};

export const formatLastSeen = (date: string | Date | null) => {
  if (!date) return "a day ago";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "yesterday";
  }

  return `${diffDays}d ago`;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
