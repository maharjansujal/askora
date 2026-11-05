export const SIGNUP_BONUS_POINTS = 100;

export const INITIAL_RANK_NAME = "Newcomer";

export const MIN_QUESTION_COST = 5;
export const MAX_QUESTION_COST = 100;

export const ACCEPTED_ANSWER_REWARD_PERCENT = 50;

export function computeAcceptedAnswerReward(
  questionPointsCost: number,
): number {
  const raw = Math.floor(
    (questionPointsCost * ACCEPTED_ANSWER_REWARD_PERCENT) / 100,
  );
  return Math.max(1, raw);
}

export type UserStatsDelta = {
  questionsAsked?: number;
  answersGiven?: number;
  acceptedAnswers?: number;
  bestAnswers?: number;
  upvotesReceived?: number;
  downvotesReceived?: number;
  currentStreak?: number;
  longestStreak?: number;
};
