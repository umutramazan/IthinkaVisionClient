import { API_REQUEST_TIMEOUT_MS } from '../constants/api';
import { getApiClient } from '../services/apiClient';

const originalApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

afterAll(() => {
  if (originalApiBaseUrl === undefined) {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  } else {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalApiBaseUrl;
  }
});

describe('Axios API istemcisi', () => {
  it('doğrulanmış base URL ve ortak timeout ile tek instance oluşturur', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://192.168.1.25:8000/';

    const firstClient = getApiClient();
    const secondClient = getApiClient();

    expect(firstClient.defaults.baseURL).toBe('http://192.168.1.25:8000');
    expect(firstClient.defaults.timeout).toBe(API_REQUEST_TIMEOUT_MS);
    expect(secondClient).toBe(firstClient);
  });
});
