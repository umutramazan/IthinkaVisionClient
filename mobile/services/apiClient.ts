import { create, type AxiosInstance } from 'axios';

import { getApiBaseUrl } from '../config/env';
import { API_REQUEST_TIMEOUT_MS } from '../constants/api';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = create({
      baseURL: getApiBaseUrl(),
      timeout: API_REQUEST_TIMEOUT_MS,
    });
  }

  return apiClient;
}
