import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<CategoryOption[]> => {
      try {
        const res = await axios.get("/api/categories");
        return res.data.categories;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to load categories",
          );
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    categories: query.data ?? [],
    isLoadingCategories: query.isLoading,
    isErrorCategories: query.isError,
  };
}
