import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useGsapReveal } from "@/hooks/useGsapReveal";

const loadGsapMock = vi.fn();

vi.mock("@/lib/motion/gsap", () => ({
  loadGsap: (...args: unknown[]) => loadGsapMock(...args) as never,
}));

vi.mock("@/lib/motion/reducedMotion", () => ({
  prefersReducedMotion: () => true,
}));

function Section() {
  const ref = useRef<HTMLElement>(null);
  useGsapReveal(ref, { delay: 0.5 });
  return (
    <section ref={ref}>
      <h1 data-reveal>Trouvez votre équilibre</h1>
      <p data-reveal>Sous-titre</p>
    </section>
  );
}

describe("useGsapReveal (reduced motion)", () => {
  it("leaves content fully visible and never loads gsap", () => {
    render(<Section />);
    const title = screen.getByRole("heading");
    expect(title).toBeVisible();
    expect(title.style.opacity).toBe("");
    expect(loadGsapMock).not.toHaveBeenCalled();
  });
});
