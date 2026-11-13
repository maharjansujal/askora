import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreateAnswerArgs {
  questionId: string;
  content: ProseMirrorDoc;
}

export function useCreateAnswer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async function ({ questionId, content }: CreateAnswerArgs) {
      try {
        const res = await axios.post(`/api/questions/${questionId}/answers`, {
          content,
        });
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to post answer",
          );
        }
        throw error;
      }
    },
    onSuccess: (_data, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["answers", questionId] });
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });
    },
  });
  return {
    createAnswer: mutation.mutateAsync,
    isCreatingAnswer: mutation.isPending,
    createError: mutation.error?.message ?? null,
  };
}
