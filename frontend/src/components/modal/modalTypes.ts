export type LegalPageKey =
  | "legal"
  | "privacy"
  | "cookies"
  | "terms"
  | "accessibility";

export type ModalId = "contact" | "corporate" | "gift" | "legal" | "cmsLogin";

export type ModalPayloads = {
  contact: { defaultSubject?: string } | undefined;
  corporate: { defaultEventType?: "corporate" | "team" | "expo" | "private" | "other" } | undefined;
  gift: undefined;
  legal: { page?: LegalPageKey } | undefined;
  cmsLogin: undefined;
};

export type ModalState<K extends ModalId = ModalId> = {
  id: K;
  payload?: ModalPayloads[K];
};
