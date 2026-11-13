"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { QuestionDetail } from "../types/questionTypes";

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
