/**
 * Ortam bağımlı değerler koda gömülmez; Expo'nun `EXPO_PUBLIC_*` değişkenleri üzerinden okunur.
 * Değerler yerelde `.env` dosyasından, EAS buildlerinde ilgili environment üzerinden gelir.
 */

const missingApiBaseUrlMessage =
  'EXPO_PUBLIC_API_BASE_URL tanımlı değil. .env.example dosyasını .env olarak kopyalayın.';
const invalidApiBaseUrlMessage =
  'EXPO_PUBLIC_API_BASE_URL geçerli bir http:// veya https:// adresi olmalıdır.';

export function isApiBaseUrlConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim());
}

export function getApiBaseUrl(): string {
  const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!rawApiBaseUrl) {
    throw new Error(missingApiBaseUrlMessage);
  }

  try {
    const parsedUrl = new URL(rawApiBaseUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error(invalidApiBaseUrlMessage);
    }
  } catch {
    throw new Error(invalidApiBaseUrlMessage);
  }

  return rawApiBaseUrl.replace(/\/+$/, '');
}
