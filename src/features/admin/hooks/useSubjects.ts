import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreateSubjectInput {
  name: string;
  slug: string;
  description?: string;
}

interface UpdateSubjectInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
}

export function useSubjects() {
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: ["admin", "subjects"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/admin/subjects");
        if (res.status !== 200) throw new Error("Failed to fetch subjects");
        return res.data.subjects;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to fetch subjects",
          );
        }
        throw error;
      }
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (input: CreateSubjectInput) => {
      try {
        const res = await axios.post("/api/admin/subjects", input);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to create subject",
          );
        }
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (input: UpdateSubjectInput) => {
      try {
        const { id, ...payload } = input;
        const res = await axios.patch(`/api/admin/subjects/${id}`, payload);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to update subject",
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await axios.delete(`/api/admin/subjects/${id}`);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to delete subject",
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });
    },
  });

  return {
    subjects: subjectsQuery.data ?? [],
    isLoadingSubjects: subjectsQuery.isLoading,
    isErrorSubjects: subjectsQuery.isError,

    createSubject: createSubjectMutation.mutateAsync,
    isCreatingSubject: createSubjectMutation.isPending,

    updateSubject: updateSubjectMutation.mutateAsync,
    isUpdatingSubject: updateSubjectMutation.isPending,

    deleteSubject: deleteSubjectMutation.mutateAsync,
    isDeletingSubject: deleteSubjectMutation.isPending,
  };
}
