const FALLBACK_API_ORIGIN = "http://localhost:8000";

export const PUBLIC_API_VERSION_PATH = "/api/v1";

export const PUBLIC_API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  FALLBACK_API_ORIGIN;

export const PUBLIC_DEMO_MEMBER_ID =
  process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "";
