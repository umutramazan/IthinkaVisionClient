import { messages } from '../constants/messages';
import { AnalyzeResponseError } from '../services/analyzeService';
import { mapAnalyzeErrorToMessage } from '../utils/analyzeError';

interface AxiosErrorFixtureOptions {
  code?: string;
  status?: number;
  hasResponse?: boolean;
}

function axiosErrorFixture({
  code,
  status,
  hasResponse = status !== undefined,
}: AxiosErrorFixtureOptions) {
  return {
    isAxiosError: true,
    code,
    response: hasResponse ? { status } : undefined,
  };
}

describe('analiz hatası mesaj eşleme', () => {
  it.each(['ECONNABORTED', 'ETIMEDOUT'])('%s timeout kodunu eşler', (code) => {
    expect(mapAnalyzeErrorToMessage(axiosErrorFixture({ code }))).toBe(messages.requestTimeout);
  });

  it.each([400, 413, 415, 422])('HTTP %d cevabını geçersiz görsel mesajına eşler', (status) => {
    expect(mapAnalyzeErrorToMessage(axiosErrorFixture({ status }))).toBe(
      messages.invalidOrLargeImage,
    );
  });

  it.each([500, 502, 503])('HTTP %d cevabını sunucu hatasına eşler', (status) => {
    expect(mapAnalyzeErrorToMessage(axiosErrorFixture({ status }))).toBe(messages.serverError);
  });

  it('cevap alınmayan ağ hatasını bağlantı mesajına eşler', () => {
    expect(mapAnalyzeErrorToMessage(axiosErrorFixture({ code: 'ERR_NETWORK' }))).toBe(
      messages.serverUnavailable,
    );
  });

  it('iptal edilen istekte kullanıcı mesajı üretmez', () => {
    expect(mapAnalyzeErrorToMessage(axiosErrorFixture({ code: 'ERR_CANCELED' }))).toBeNull();
  });

  it('API success false cevabındaki validasyon kodunu eşler', () => {
    const error = new AnalyzeResponseError({
      success: false,
      error: {
        code: 'IMAGE_TOO_LARGE',
        message: 'Görsel boyutu sınırı aşıyor.',
      },
    });

    expect(mapAnalyzeErrorToMessage(error)).toBe(messages.invalidOrLargeImage);
  });

  it('API iç sunucu hatasını genel sunucu mesajına eşler', () => {
    const error = new AnalyzeResponseError({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Beklenmeyen sunucu hatası.',
      },
    });

    expect(mapAnalyzeErrorToMessage(error)).toBe(messages.serverError);
  });

  it('bilinmeyen hatada güvenli genel mesaj döndürür', () => {
    expect(mapAnalyzeErrorToMessage(new Error('sensitive detail'))).toBe(messages.serverError);
  });
});
