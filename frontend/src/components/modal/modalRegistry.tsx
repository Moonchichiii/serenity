import type { ModalId } from "./modalTypes";
import ContactModalScreen from "@/components/screens/ContactModalScreen";
import CorporateModalScreen from "@/components/screens/CorporateModalScreen";
import GiftVoucherModalScreen from "@/components/screens/GiftVoucherModalScreen";
import CMSLoginModalScreen from "@/components/screens/CMSLoginModalScreen";
import  LegalModalScreen from "@/components/screens/LegalModalScreen";

export const modalRegistry: Record<ModalId, React.ComponentType> = {
  contact: ContactModalScreen,
  corporate: CorporateModalScreen,
  gift: GiftVoucherModalScreen,
  cmsLogin: CMSLoginModalScreen,
  legal: LegalModalScreen,
};

export const modalMeta: Partial<
  Record<ModalId, { className?: string; scrollable?: boolean }>
> = {
  contact: { className: 'max-w-lg', scrollable: true },
  gift: { className: 'max-w-lg', scrollable: true },
  cmsLogin: { className: 'max-w-lg', scrollable: true },
  corporate: { className: 'max-w-3xl md:max-w-4xl', scrollable: true },
  legal: { className: 'max-w-4xl', scrollable: true },
} as const
