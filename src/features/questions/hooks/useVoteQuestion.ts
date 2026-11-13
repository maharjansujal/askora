import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface VoteQuestionArgs {
  questionId: string;
  value: "UPVOTE" | "DOWNVOTE";
}

export function useVoteQuestion() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ questionId, value }: VoteQuestionArgs) => {
      try {
        const res = await axios.post(`/api/questions/${questionId}/vote`, {
          value,
        });
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to record vote",
          );
        }
        throw error;
      }
    },
    onSuccess: (_data, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return {
    voteQuestion: mutation.mutateAsync,
    isVoting: mutation.isPending,
    voteError: mutation.error?.message ?? null,
  };
}
