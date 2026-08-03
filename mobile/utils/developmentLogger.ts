export type DevelopmentLogLevel = 'info' | 'warn' | 'error';

export interface AnalysisLogFields {
  model_type: 'detection';
  duration_ms?: number;
  detection_count?: number;
  error_code?: string;
  request_id?: string;
  status?: number;
}

export function logDevelopmentEvent(
  level: DevelopmentLogLevel,
  event: string,
  fields: AnalysisLogFields,
): void {
  if (!__DEV__) {
    return;
  }

  const payload = Object.fromEntries(
    Object.entries({ event, ...fields }).filter(([, value]) => value !== undefined),
  );

  if (level === 'error') {
    console.error('[analysis]', payload);
    return;
  }

  if (level === 'warn') {
    console.warn('[analysis]', payload);
    return;
  }

  console.info('[analysis]', payload);
}
