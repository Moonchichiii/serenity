import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD
    ? "https://serenity.fly.dev"
    : "http://localhost:8000");

function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();

  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrftoken = getCookie("csrftoken");
    if (csrftoken) {
      config.headers["X-CSRFToken"] = csrftoken;
    }
  }

  return config;
});
