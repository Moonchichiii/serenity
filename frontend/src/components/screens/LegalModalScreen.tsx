import { Suspense, lazy, useMemo } from "react"
import { useModal } from "@/components/modal/useModal"

type LegalPageKey =
  | "legal"
  | "privacy"
  | "cookies"
  | "terms"
  | "accessibility"

const LegalNotice = lazy(() =>
  import("@/components/legal/LegalNotice").then((m) => ({
    default: m.LegalNotice,
  })),
)
const PrivacyPolicy = lazy(() =>
  import("@/components/legal/PrivacyPolicy").then((m) => ({
    default: m.PrivacyPolicy,
  })),
)
const CookiePolicy = lazy(() =>
  import("@/components/legal/CookiePolicy").then((m) => ({
    default: m.CookiePolicy,
  })),
)
const TermsAndConditions = lazy(() =>
  import("@/components/legal/TermsAndConditions").then((m) => ({
    default: m.TermsAndConditions,
  })),
)
const AccessibilityStatement = lazy(() =>
  import("@/components/legal/AccessibilityStatement").then((m) => ({
    default: m.AccessibilityStatement,
  })),
)

export default function LegalModalScreen() {
  const { getPayload } = useModal()
  const page = (getPayload("legal")?.page ?? "legal") as LegalPageKey

  const Content = useMemo(() => {
    switch (page) {
      case "privacy":
        return PrivacyPolicy
      case "cookies":
        return CookiePolicy
      case "terms":
        return TermsAndConditions
      case "accessibility":
        return AccessibilityStatement
      case "legal":
      default:
        return LegalNotice
    }
  }, [page])

  return (
    <Suspense
      fallback={
        <div className="p-2 text-center text-charcoal/70">Loading…</div>
      }
    >
      <Content />
    </Suspense>
  )
}
