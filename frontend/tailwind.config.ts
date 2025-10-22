import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // @ts-expect-error - safelist is valid but may not be in older type definitions
  safelist: [
    "object-cover",
    "object-contain",
    "object-fill",
    "object-none",
    "object-scale-down",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
