import { lazy, type ComponentType } from "react";
import type { ModalId } from "./modalTypes";

const ContactModalScreen = lazy(
  () => import("@/components/screens/ContactModalScreen"),
);
const CorporateModalScreen = lazy(
  () => import("@/components/screens/CorporateInquiryScreen"),
);
const GiftVoucherModalScreen = lazy(
  () => import("@/components/screens/GiftVoucherModalScreen"),
);
const CMSLoginModalScreen = lazy(
  () => import("@/components/screens/CMSLoginModalScreen"),
);
const LegalModalScreen = lazy(
  () => import("@/components/screens/LegalModalScreen"),
);

export const modalRegistry: Record<ModalId, ComponentType> = {
  contact: ContactModalScreen,
  corporate: CorporateModalScreen,
  gift: GiftVoucherModalScreen,
  cmsLogin: CMSLoginModalScreen,
  legal: LegalModalScreen,
};

export const modalMeta: Record<
  ModalId,
  { className?: string; scrollable?: boolean }
> = {
  contact: { className: "max-w-lg", scrollable: true },
  gift: { className: "max-w-lg", scrollable: true },
  cmsLogin: { className: "max-w-lg", scrollable: true },
  corporate: { className: "max-w-3xl md:max-w-4xl", scrollable: true },
  legal: { className: "max-w-4xl", scrollable: true },
};
