import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { VoteValue } from "../types/answerTypes";

interface VoteAnswerArgs {
  answerId: string;
  questionId: string;
  value: VoteValue;
}

export function useVoteAnswer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ answerId, value }: VoteAnswerArgs) => {
      try {
        const res = await axios.post(`/api/answers/${answerId}/vote`, {
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
      queryClient.invalidateQueries({ queryKey: ["answers", questionId] });
    },
  });

  return {
    voteAnswer: mutation.mutateAsync,
    isVoting: mutation.isPending,
    voteError: mutation.error?.message ?? null,
  };
}
