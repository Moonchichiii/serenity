import { describe, it, expect } from "vitest";
import {
  extractPublicId,
  buildCloudinaryUrl,
  buildCloudinaryVideoUrl,
  getOptimizedUrl,
  getOptimizedVideoUrl,
  getOptimizedBackgroundCover,
  getOptimizedThumbnail,
} from "../cloudinary";

describe("extractPublicId", () => {
  it("extracts public ID from image upload URL", () => {
    const url =
      "https://res.cloudinary.com/dbzlaawqt/image/upload/v1234567890/folder/my-image.jpg";
    expect(extractPublicId(url)).toBe("folder/my-image");
  });

  it("extracts public ID from video upload URL", () => {
    const url =
      "https://res.cloudinary.com/dbzlaawqt/video/upload/v1234567890/folder/clip.mp4";
    expect(extractPublicId(url)).toBe("folder/clip");
  });

  it("extracts public ID without version prefix", () => {
    const url =
      "https://res.cloudinary.com/dbzlaawqt/image/upload/folder/my-image.jpg";
    expect(extractPublicId(url)).toBe("folder/my-image");
  });

  it("returns the input as-is when it is not a URL", () => {
    expect(extractPublicId("folder/my-image")).toBe(
      "folder/my-image"
    );
  });

  it("returns null for empty string", () => {
    expect(extractPublicId("")).toBeNull();
  });

  it("returns null for non-cloudinary URLs that don't match pattern", () => {
    expect(
      extractPublicId("https://example.com/random-image.jpg")
    ).toBeNull();
  });
});

describe("buildCloudinaryUrl", () => {
  it("builds URL without transformations", () => {
    const url = buildCloudinaryUrl("folder/image");
    expect(url).toBe(
      "https://res.cloudinary.com/dbzlaawqt/image/upload/folder/image"
    );
  });

  it("builds URL with transformations", () => {
    const url = buildCloudinaryUrl("folder/image", [
      "w_400",
      "f_auto",
    ]);
    expect(url).toBe(
      "https://res.cloudinary.com/dbzlaawqt/image/upload/w_400,f_auto/folder/image"
    );
  });
});

describe("buildCloudinaryVideoUrl", () => {
  it("builds video URL and strips .mp4 from public ID", () => {
    const url = buildCloudinaryVideoUrl("folder/clip.mp4", [
      "f_mp4",
    ]);
    expect(url).toContain("/video/upload/");
    expect(url.endsWith("/folder/clip.mp4")).toBe(true);
    expect(url).not.toContain("clip.mp4.mp4");
  });
});

describe("getOptimizedUrl", () => {
  it("returns empty string for empty input", () => {
    expect(getOptimizedUrl("")).toBe("");
  });

  it("applies width and quality transforms", () => {
    const url = getOptimizedUrl("folder/image", 800, "good");
    expect(url).toContain("w_800");
    expect(url).toContain("q_auto:good");
    expect(url).toContain("f_auto");
    expect(url).toContain("dpr_1.5");
  });

  it("defaults to eco quality", () => {
    const url = getOptimizedUrl("folder/image", 400);
    expect(url).toContain("q_auto:eco");
  });
});

describe("getOptimizedVideoUrl", () => {
  it("returns empty string for empty input", () => {
    expect(getOptimizedVideoUrl("")).toBe("");
  });

  it("applies f_mp4 and width transforms", () => {
    const url = getOptimizedVideoUrl("folder/clip", 1280, "good");
    expect(url).toContain("f_mp4");
    expect(url).toContain("w_1280");
    expect(url).toContain("q_auto:good");
  });
});

describe("getOptimizedBackgroundCover", () => {
  it("scales width by 1.2x", () => {
    const url = getOptimizedBackgroundCover("folder/bg", 640);
    // 640 * 1.2 = 768
    expect(url).toContain("w_768");
  });
});

describe("getOptimizedThumbnail", () => {
  it("returns empty string for empty input", () => {
    expect(getOptimizedThumbnail("")).toBe("");
  });

  it("applies square crop transforms", () => {
    const url = getOptimizedThumbnail("folder/thumb", 150);
    expect(url).toContain("w_150");
    expect(url).toContain("h_150");
    expect(url).toContain("c_fill");
  });

  it("defaults to 200px size", () => {
    const url = getOptimizedThumbnail("folder/thumb");
    expect(url).toContain("w_200");
    expect(url).toContain("h_200");
  });
});
