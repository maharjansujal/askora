"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

export function useQuestion(id: string) {
  const query = useQuery({
    queryKey: ["question", id],
    queryFn: async (): Promise<QuestionDetail> => {
      try {
        const res = await axios.get(`/api/questions/${id}`);
        return res.data.question;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to load question",
          );
        }
        throw error;
      }
    },
    staleTime: 1000 * 30,
  });

  return {
    question: query.data ?? null,
    isLoadingQuestion: query.isLoading,
    isErrorQuestion: query.isError,
  };
}
