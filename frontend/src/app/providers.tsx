import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import "@/i18n/config";
import "@/styles/globals.css";

import { router } from "./router";
import { queryClient } from "../lib/queryClient";
import { ModalProvider } from "@/components/modal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LazyToaster } from "@/components/ui/LazyToaster";

export function AppProviders() {
  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ModalProvider>
            <RouterProvider router={router} />
          </ModalProvider>

          <LazyToaster />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
