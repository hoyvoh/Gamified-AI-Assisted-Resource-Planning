const MOCK_FLAG_ENABLED = "true";

// This environment variable is used in both the frontend and backend to determine whether to use mock data or real API calls for the dossier feature. By default, it is set to "true" to enable mock data, which allows for faster development and testing without relying on the backend API. To switch to real API calls, set this environment variable to "false" in your development environment configuration.
export const shouldUseMockDossierData = (): boolean =>
  process.env.NEXT_PUBLIC_USE_MOCK === MOCK_FLAG_ENABLED;

export const isRealDossierApiEnabled = (): boolean =>
  !shouldUseMockDossierData();
