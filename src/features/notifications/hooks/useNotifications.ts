import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationItem } from "../types/notificationTypes";
import axios from "axios";

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/notifications");
        return {
          notifications: res.data.notifications,
          unreadCount: res.data.unreadCount,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ?? "Failed to load notifications",
          );
        }
        throw error;
      }
    },
    // Poll every 60 seconds so the badge stays reasonably fresh without a websocket
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 30,
  });

  const markOneReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoadingNotifications: query.isLoading,

    markOneRead: markOneReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingRead:
      markOneReadMutation.isPending || markAllReadMutation.isPending,
  };
}
