"use client";

import { AlertProvider } from "@/src/components/alert/AlertProvider";
import { ConfirmProvider } from "@/src/components/confirm/ConfirmProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <AlertProvider>
      <ConfirmProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConfirmProvider>
    </AlertProvider>
  );
}
