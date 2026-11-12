import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";

export type QuestionListItem = {
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
};

export type QuestionsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UseQuestionsParams = {
  subjectId?: string;
  categoryId?: string;
  q?: string;
  page?: number;
};

export function useQuestions(params: UseQuestionsParams = {}) {
  const query = useQuery({
    queryKey: ["questions", params],
    queryFn: async (): Promise<{
      questions: QuestionListItem[];
      pagination: QuestionsPagination;
    }> => {
      try {
        const res = await axios.get("/api/questions", { params });
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to load questions",
          );
        }
        throw error;
      }
    },
    // Keeps the old list visible while paginating — avoids full-page spinner
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds — questions change fairly often
  });

  return {
    questions: query.data?.questions ?? [],
    pagination: query.data?.pagination ?? {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },
    isLoadingQuestions: query.isLoading,
    isFetchingQuestions: query.isFetching,
    isErrorQuestions: query.isError,
  };
}
