import { logDevelopmentEvent } from '../utils/developmentLogger';

const developmentGlobal = globalThis as typeof globalThis & { __DEV__: boolean };
const originalDev = developmentGlobal.__DEV__;

function setDevelopmentMode(value: boolean) {
  Object.defineProperty(developmentGlobal, '__DEV__', {
    configurable: true,
    value,
  });
}

afterEach(() => {
  setDevelopmentMode(originalDev);
  jest.restoreAllMocks();
});

describe('development logger', () => {
  it('development modunda yalnızca tanımlı teknik alanları loglar', () => {
    setDevelopmentMode(true);
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation();

    logDevelopmentEvent('info', 'analysis_completed', {
      model_type: 'detection',
      duration_ms: 42,
      detection_count: 2,
      request_id: 'request-123',
      status: 200,
    });

    expect(consoleInfo).toHaveBeenCalledWith('[analysis]', {
      event: 'analysis_completed',
      model_type: 'detection',
      duration_ms: 42,
      detection_count: 2,
      request_id: 'request-123',
      status: 200,
    });
  });

  it('undefined teknik alanları log payloadından çıkarır', () => {
    setDevelopmentMode(true);
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    logDevelopmentEvent('warn', 'analysis_timeout', {
      model_type: 'detection',
      duration_ms: 15_000,
      error_code: 'ETIMEDOUT',
      request_id: undefined,
    });

    expect(consoleWarn).toHaveBeenCalledWith('[analysis]', {
      event: 'analysis_timeout',
      model_type: 'detection',
      duration_ms: 15_000,
      error_code: 'ETIMEDOUT',
    });
  });

  it('production modunda console logu üretmez', () => {
    setDevelopmentMode(false);
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation();
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    logDevelopmentEvent('error', 'analysis_failed', {
      model_type: 'detection',
      error_code: 'INTERNAL_ERROR',
    });

    expect(consoleInfo).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
