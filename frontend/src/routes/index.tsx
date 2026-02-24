import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/features/home/hero";
import { Suspense, lazy } from "react";

const About = lazy(() =>
  import("@/features/about/AboutSection").then((m) => ({ default: m.About })),
);

const Services = lazy(() =>
  import("@/features/services/ServicesSection").then((m) => ({
    default: m.Services,
  })),
);

const ReviewTrigger = lazy(() =>
  import("@/features/testimonials/components/ReviewTrigger").then((m) => ({
    default: m.ReviewTrigger,
  })),
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

export const Route = createFileRoute("/")({
  component: HomePage,
});
