import { describe, it, expect } from "vitest";
import {
  CLOUDINARY_CLOUD_NAME,
  getOptimizedCloudinaryUrl,
} from "../cloudinary";

const BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

describe("getOptimizedCloudinaryUrl", () => {
  it("returns empty string unchanged", () => {
    expect(getOptimizedCloudinaryUrl("")).toBe("");
  });

  it("returns non-Cloudinary URLs unchanged", () => {
    const url = "https://example.com/images/photo.jpg";
    expect(getOptimizedCloudinaryUrl(url, 640)).toBe(url);
  });

  it("skips URLs that already carry Cloudinary transforms", () => {
    const url = `${BASE}/image/upload/f_auto,q_auto:good,w_800/v1/media/hero`;
    expect(getOptimizedCloudinaryUrl(url, 320, "low")).toBe(url);
  });

  it("applies eco quality by default and preserves the version prefix", () => {
    const url = `${BASE}/image/upload/v1234567890/folder/my-image`;
    expect(getOptimizedCloudinaryUrl(url)).toBe(
      `${BASE}/image/upload/f_auto,q_auto:eco/v1234567890/folder/my-image`,
    );
  });

  it("applies good quality when requested", () => {
    const url = `${BASE}/image/upload/v1/media/hero`;
    expect(getOptimizedCloudinaryUrl(url, undefined, "good")).toBe(
      `${BASE}/image/upload/f_auto,q_auto:good/v1/media/hero`,
    );
  });

  it("applies low quality when requested", () => {
    const url = `${BASE}/image/upload/v1/media/hero`;
    expect(getOptimizedCloudinaryUrl(url, undefined, "low")).toBe(
      `${BASE}/image/upload/f_auto,q_auto:low/v1/media/hero`,
    );
  });

  it("adds width with c_limit when width is given", () => {
    const url = `${BASE}/image/upload/v1/media/hero`;
    expect(getOptimizedCloudinaryUrl(url, 640)).toBe(
      `${BASE}/image/upload/f_auto,q_auto:eco,w_640,c_limit/v1/media/hero`,
    );
  });

  it("handles URLs without a version prefix", () => {
    const url = `${BASE}/image/upload/folder/my-image`;
    expect(getOptimizedCloudinaryUrl(url, 480)).toBe(
      `${BASE}/image/upload/f_auto,q_auto:eco,w_480,c_limit/folder/my-image`,
    );
  });

  it("also optimizes video upload URLs", () => {
    const url = `${BASE}/video/upload/v99/media/clip`;
    expect(getOptimizedCloudinaryUrl(url)).toBe(
      `${BASE}/video/upload/f_auto,q_auto:eco/v99/media/clip`,
    );
  });
});
