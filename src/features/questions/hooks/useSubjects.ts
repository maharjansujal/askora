import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type SubjectOption = {
  id: string;
  name: string;
  slug: string;
};

export function useSubjects() {
  const query = useQuery({
    queryKey: ["subjects"],
    queryFn: async (): Promise<SubjectOption[]> => {
      try {
        const res = await axios.get("/api/subjects");
        return res.data.subjects;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to load subjects",
          );
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes — subjects rarely change
  });

  return {
    subjects: query.data ?? [],
    isLoadingSubjects: query.isLoading,
    isErrorSubjects: query.isError,
  };
}
