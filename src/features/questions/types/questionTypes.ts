export type VoteValue = "UPVOTE" | "DOWNVOTE";

export type QuestionDetail = {
  id: string;
  title: string;
  content: unknown;
  pointsCost: number;
  status: "OPEN" | "CLOSED" | "DELETED";
  commentsEnabled: boolean;
  createdAt: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  subjectId: string;
  subjectName: string;
  categories: { id: string; name: string; slug: string }[];
  score: number;
  userVote: "UPVOTE" | "DOWNVOTE" | null;
};
