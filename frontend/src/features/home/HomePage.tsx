import { Suspense, lazy } from "react";
import { Hero } from "@/features/home/hero";

const About = lazy(() =>
  import("@/features/about/AboutSection").then((m) => ({
    default: m.About,
  })),
);

const Services = lazy(() =>
  import("@/features/services/ServicesSection").then((m) => ({
    default: m.Services,
  })),
);

const Faq = lazy(() =>
  import("@/features/faq/Faq").then((m) => ({ default: m.Faq })),
);

const ReviewTrigger = lazy(() =>
  import("@/features/testimonials/components/ReviewTrigger").then((m) => ({
    default: m.ReviewTrigger,
  })),
);

export function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="h-96" />}>
        <About />
        <Services />
        <Faq />
        <ReviewTrigger targetSectionId="testimonials" />
      </Suspense>
    </>
  );
}
