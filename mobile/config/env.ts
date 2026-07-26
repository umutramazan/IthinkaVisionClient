/**
 * Ortam bağımlı değerler koda gömülmez; Expo'nun `EXPO_PUBLIC_*` değişkenleri üzerinden okunur.
 * Değerler `.env`, `.env.development` veya `.env.production` dosyalarından gelir.
 */

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const isApiBaseUrlConfigured = Boolean(rawApiBaseUrl);

export function getApiBaseUrl(): string {
  if (!rawApiBaseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL tanımlı değil. .env.example dosyasını .env olarak kopyalayın.',
    );
  }

  return rawApiBaseUrl.replace(/\/+$/, '');
}
