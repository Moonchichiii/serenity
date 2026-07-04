import { createFileRoute } from "@tanstack/react-router";

import { OffrirPage } from "@/features/offrir/OffrirPage";

export const Route = createFileRoute("/offrir")({
  component: OffrirPage,
});
