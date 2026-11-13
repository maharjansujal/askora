import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface AcceptAnswerArgs {
  answerId: string;
  questionId: string;
}

export function useAcceptAnswer() {
  const queryClient = useQueryClient();

  function invalidateQueries(questionId: string) {
    queryClient.invalidateQueries({ queryKey: ["answers", questionId] });
    queryClient.invalidateQueries({ queryKey: ["question", questionId] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }

  const acceptMutation = useMutation({
    mutationFn: async ({ answerId }: AcceptAnswerArgs) => {
      try {
        const res = await axios.post(`/api/answers/${answerId}/accept`);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to accept answer",
          );
        }
        throw error;
      }
    },
    onSuccess: (_data, { questionId }) => {
      invalidateQueries(questionId);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ answerId }: AcceptAnswerArgs) => {
      try {
        const res = await axios.delete(`/api/answers/${answerId}/accept`);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to revoke acceptance",
          );
        }
        throw error;
      }
    },
    onSuccess: (_data, { questionId }) => {
      invalidateQueries(questionId);
    },
  });

  return {
    acceptAnswer: acceptMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    acceptError: acceptMutation.error?.message ?? null,

    revokeAcceptance: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    revokeError: revokeMutation.error?.message ?? null,
  };
}
