import { describe, it, expect } from "vitest";
import { getLocalizedText } from "../localize";

describe("getLocalizedText", () => {
  const obj = {
    title_en: "English Title",
    title_fr: "Titre Français",
    description_en: "English description",
    description_fr: "",
    empty_en: "",
    empty_fr: "",
    only_fr_en: "",
    only_fr_fr: "Seulement en français",
  };

  it("returns primary language field when available (en)", () => {
    expect(getLocalizedText(obj, "title", "en")).toBe("English Title");
  });

  it("returns primary language field when available (fr)", () => {
    expect(getLocalizedText(obj, "title", "fr")).toBe("Titre Français");
  });

  it("falls back to secondary language when primary is empty", () => {
    // description_fr is empty, should fall back to description_en
    expect(getLocalizedText(obj, "description", "fr")).toBe(
      "English description"
    );
  });

  it("falls back to fr when en is empty", () => {
    expect(getLocalizedText(obj, "only_fr", "en")).toBe(
      "Seulement en français"
    );
  });

  it("returns empty string when both languages are empty", () => {
    expect(getLocalizedText(obj, "empty", "en")).toBe("");
  });

  it("returns empty string when field does not exist", () => {
    expect(getLocalizedText(obj, "nonexistent", "en")).toBe("");
  });

  it("returns empty string for null input", () => {
    expect(getLocalizedText(null, "title", "en")).toBe("");
  });

  it("returns empty string for non-object input", () => {
    expect(getLocalizedText("string", "title", "en")).toBe("");
  });
});
