import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { AnswerItem } from "../components/AnswerList";

export function useAnswers(questionId: string, initialData?: AnswerItem[]) {
  const query = useQuery({
    queryKey: ["answers", questionId],
    queryFn: async (): Promise<AnswerItem[]> => {
      try {
        const res = await axios.get(`/api/questions/${questionId}/answers`);
        return res.data.answers;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to load answers",
          );
        }
        throw error;
      }
    },
    initialData,
    staleTime: 1000 * 30,
  });

  return {
    answers: query.data ?? initialData ?? [],
    isLoadingAnswers: query.isLoading,
    isFetchingAnswers: query.isFetching,
  };
}
