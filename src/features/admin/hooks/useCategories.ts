import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreateCategoryInput {
  name: string;
  slug: string;
}

interface UpdateCategoryInput {
  id: string;
  name?: string;
  slug?: string;
}

export function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/admin/categories");
        if (res.status !== 200) throw new Error("Failed to fetch categories");
        return res.data.categories;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to fetch categories",
          );
        }
        throw error;
      }
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      try {
        const res = await axios.post("/api/admin/categories", input);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to create category",
          );
        }
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      try {
        const { id, ...payload } = input;
        const res = await axios.patch(`/api/admin/categories/${id}`, payload);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to update category",
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await axios.delete(`/api/admin/categories/${id}`);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to delete category",
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    isErrorCategories: categoriesQuery.isError,

    createCategory: createCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,

    updateCategory: updateCategoryMutation.mutateAsync,
    isUpdatingCategory: updateCategoryMutation.isPending,

    deleteCategory: deleteCategoryMutation.mutateAsync,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
}
