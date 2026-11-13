export const SIGNUP_BONUS_POINTS = 100;

export const INITIAL_RANK_NAME = "Newcomer";

export const MIN_QUESTION_COST = 5;
export const MAX_QUESTION_COST = 100;

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
