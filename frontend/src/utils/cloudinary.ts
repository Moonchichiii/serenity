export const CLOUDINARY_CLOUD_NAME =
  import.meta.env["VITE_CLOUDINARY_CLOUD_NAME"] || "dbzlaawqt";

export function getOptimizedCloudinaryUrl(
  url: string,
  width?: number,
  quality: "eco" | "good" | "low" = "eco",
): string {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  // Skip URLs that already have Cloudinary transforms
  if (/\/upload\/[a-z]_/.test(url)) {
    return url;
  }

  const q =
    quality === "good"
      ? "q_auto:good"
      : quality === "low"
        ? "q_auto:low"
        : "q_auto:eco";

  const transforms = ["f_auto", q];

  if (width) {
    transforms.push(`w_${width}`, "c_limit");
  }

  return url.replace(
    /\/upload\/(v\d+\/)?/,
    `/upload/${transforms.join(",")}/$1`,
  );
}
