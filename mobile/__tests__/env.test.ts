import { getApiBaseUrl, isApiBaseUrlConfigured } from '../config/env';

const originalApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

afterEach(() => {
  if (originalApiBaseUrl === undefined) {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  } else {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalApiBaseUrl;
  }
});

describe('API ortam yapılandırması', () => {
  it.each([
    ['HTTP geliştirme adresi', 'http://192.168.1.25:8000'],
    ['HTTPS production adresi', 'https://vision-api.example.com'],
  ])('%s kabul eder', (_, apiBaseUrl) => {
    process.env.EXPO_PUBLIC_API_BASE_URL = apiBaseUrl;

    expect(isApiBaseUrlConfigured()).toBe(true);
    expect(getApiBaseUrl()).toBe(apiBaseUrl);
  });

  it('boşlukları ve sondaki eğik çizgileri temizler', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = '  http://192.168.1.25:8000///  ';

    expect(getApiBaseUrl()).toBe('http://192.168.1.25:8000');
  });

  it('değer eksik olduğunda açıklayıcı hata üretir', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    expect(isApiBaseUrlConfigured()).toBe(false);
    expect(() => getApiBaseUrl()).toThrow('EXPO_PUBLIC_API_BASE_URL tanımlı değil');
  });

  it.each(['sunucu-adresi', 'ftp://vision-api.example.com'])(
    'geçersiz adresi reddeder: %s',
    (apiBaseUrl) => {
      process.env.EXPO_PUBLIC_API_BASE_URL = apiBaseUrl;

      expect(() => getApiBaseUrl()).toThrow(
        'EXPO_PUBLIC_API_BASE_URL geçerli bir http:// veya https:// adresi olmalıdır.',
      );
    },
  );
});
