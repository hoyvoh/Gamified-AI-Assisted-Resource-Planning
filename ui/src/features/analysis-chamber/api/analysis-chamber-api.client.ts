import type {
  ApiErrorResponse,
  DataEnvelope,
} from "@/features/analysis-chamber/api/analysis-chamber-api.types";
import { PUBLIC_API_ORIGIN, PUBLIC_API_VERSION_PATH } from "@/lib/config/env";

const normalizeBaseUrl = (value: string | undefined): string => {
  const baseUrl = (value?.trim() || PUBLIC_API_ORIGIN).replace(/\/+$/, "");

  return baseUrl.endsWith(PUBLIC_API_VERSION_PATH)
    ? baseUrl
    : `${baseUrl}${PUBLIC_API_VERSION_PATH}`;
};

export const ANALYSIS_CHAMBER_API_BASE_URL = normalizeBaseUrl(
  PUBLIC_API_ORIGIN,
);

export class AnalysisChamberApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AnalysisChamberApiError";
    this.status = status;
  }
}

export const isAnalysisChamberApiErrorStatus = (
  error: unknown,
  status: number,
): error is AnalysisChamberApiError =>
  error instanceof AnalysisChamberApiError && error.status === status;

const buildUrl = (
  path: string,
  query?: Record<string, string | number | null | undefined>,
): string => {
  const url = new URL(`${ANALYSIS_CHAMBER_API_BASE_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as ApiErrorResponse;
    return body.detail ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

export const fetchEnvelope = async <T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | null | undefined>,
): Promise<T> => {
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new AnalysisChamberApiError(
      await parseErrorMessage(response),
      response.status,
    );
  }

  const envelope = (await response.json()) as DataEnvelope<T>;
  return envelope.data;
};

export const postEnvelope = async <TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> =>
  fetchEnvelope<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
