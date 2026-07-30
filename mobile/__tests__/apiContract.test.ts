import type { AnalyzeErrorCode, AnalyzeResponse } from '../types/api';

const serverErrorCodes: readonly AnalyzeErrorCode[] = [
  'INVALID_IMAGE',
  'INVALID_MODEL_TYPE',
  'UNSUPPORTED_IMAGE_TYPE',
  'IMAGE_TOO_LARGE',
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
];

describe('analiz API sözleşmesi', () => {
  it('başarılı cevabı detection listesiyle temsil eder', () => {
    const response = {
      success: true,
      detections: [{ class: 'Person', confidence: 0.96 }],
    } satisfies AnalyzeResponse;

    expect(response.detections).toEqual([{ class: 'Person', confidence: 0.96 }]);
  });

  it('hata cevabını kod ve mesajla temsil eder', () => {
    const response = {
      success: false,
      error: {
        code: 'INVALID_IMAGE',
        message: 'Geçersiz veya desteklenmeyen görsel.',
      },
    } satisfies AnalyzeResponse;

    expect(response.error.code).toBe('INVALID_IMAGE');
  });

  it('sunucunun desteklediği hata kodlarını birebir içerir', () => {
    expect(serverErrorCodes).toEqual([
      'INVALID_IMAGE',
      'INVALID_MODEL_TYPE',
      'UNSUPPORTED_IMAGE_TYPE',
      'IMAGE_TOO_LARGE',
      'VALIDATION_ERROR',
      'INTERNAL_ERROR',
    ]);
  });
});
