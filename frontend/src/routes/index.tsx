/* eslint-disable react-refresh/only-export-components */
import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { Hero } from "@/features/home/hero";
import { Suspense, lazy } from "react";

const About = lazy(() =>
  import("@/features/about/about").then((m) => ({
    default: m.About,
  }))
);
const Services = lazy(() =>
  import("@/features/services/Services").then((m) => ({
    default: m.Services,
  }))
);
const ReviewTrigger = lazy(() =>
  import(
    "@/features/testimonials/components/ReviewTrigger"
  ).then((m) => ({ default: m.ReviewTrigger }))
);

function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="h-96" />}>
        <About />
        <Services />
        <ReviewTrigger targetSectionId="testimonials" />
      </Suspense>
    </>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomePage,
});
