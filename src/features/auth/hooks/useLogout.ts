import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const logoutFn = async () => {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      router.push("/login");
      router.refresh(); // clears any cached server component data
    },
    onError: (err) => {
      console.error("Logout error:", err);
    },
  });
};
