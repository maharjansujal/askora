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
