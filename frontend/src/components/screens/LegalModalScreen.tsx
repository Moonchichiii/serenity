import { useMemo } from "react";
import { useModal } from "@/components/modal/useModal";

import { LegalNotice } from "@/components/legal/LegalNotice";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { CookiePolicy } from "@/components/legal/CookiePolicy";
import { TermsAndConditions } from "@/components/legal/TermsAndConditions";
import { AccessibilityStatement } from "@/components/legal/AccessibilityStatement";

type LegalPageKey =
  | "legal"
  | "privacy"
  | "cookies"
  | "terms"
  | "accessibility";

export default function LegalModalScreen() {
  const { getPayload } = useModal();
  const page = (getPayload("legal")?.page ?? "legal") as LegalPageKey;

  const Content = useMemo(() => {
    switch (page) {
      case "privacy":
        return PrivacyPolicy;
      case "cookies":
        return CookiePolicy;
      case "terms":
        return TermsAndConditions;
      case "accessibility":
        return AccessibilityStatement;
      case "legal":
      default:
        return LegalNotice;
    }
  }, [page]);

  return <Content />;
}
