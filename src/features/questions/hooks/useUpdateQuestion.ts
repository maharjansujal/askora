import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface UpdateQuestionArgs {
  questionId: string;
  title: string;
  content: ProseMirrorDoc;
  subjectId: string;
  categoryIds: Array<string>;
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      questionId,
      title,
      content,
      subjectId,
      categoryIds,
    }: UpdateQuestionArgs) => {
      try {
        const res = await axios.patch(`/api/questions/${questionId}`, {
          title,
          content,
          subjectId,
          categoryIds,
        });
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to update question",
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
    updateQuestion: mutation.mutateAsync,
    isUpdatingQuestion: mutation.isPending,
    updateQuestionError: mutation.error?.message ?? null,
  };
}
