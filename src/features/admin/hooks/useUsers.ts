import { Role } from "@/src/db/schema";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";

type CreateUserPayload = {
  username: string;
  email: string;
  password?: string;
  displayName: string;
  bio?: string;
  role: Role;
};

type UpdateUserPayload = {
  id: string;
  role?: string;
  status?: string;
  suspendedUntil?: string;
};

export function useUsers() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/admin/users");
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to fetch users",
          );
        }
        throw error;
      }
    },
  });

  const userQuery = useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => {
      try {
        const res = await axios.get(`/admin/users/${id}`);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to fetch user",
          );
        }
        throw error;
      }
    },
    enabled: !!id,
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      try {
        const res = await axios.post("/api/admin/users", payload);
        console.log("Users query", usersQuery);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to create user",
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updatePayload: UpdateUserPayload) => {
      try {
        const res = await axios.patch(
          `/api/admin/users/${updatePayload.id}`,
          updatePayload,
        );
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to update user",
          );
        }
        throw error;
      }
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await axios.patch(`/api/admin/users/${id}`, {
          status: "BANNED",
        });
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to ban user",
          );
        }
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "user", id],
      });
    },
  });

  return {
    users: usersQuery.data?.users ?? [],
    isUsersLoading: usersQuery.isPending,

    user: userQuery.data,
    isUserLoading: userQuery.isPending,

    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,

    updateUser: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    banUser: banUserMutation.mutateAsync,
    isBanningUser: banUserMutation.isPending,
  };
}
