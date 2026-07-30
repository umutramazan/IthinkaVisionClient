import { useCallback, useEffect, useRef, useState } from 'react';

import { analyzeImage } from '../services/analyzeService';
import type { ModelType } from '../types/api';
import type { Detection } from '../types/detection';
import type { PickedImage } from '../types/image';
import { mapAnalyzeErrorToMessage } from '../utils/analyzeError';

export function useAnalyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [detections, setDetections] = useState<readonly Detection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(false);
  const isRequestInFlightRef = useRef(false);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      isRequestInFlightRef.current = false;
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
    };
  }, []);

  const analyze = useCallback(async (image: PickedImage, modelType: ModelType) => {
    if (isRequestInFlightRef.current) {
      return;
    }

    const controller = new AbortController();
    isRequestInFlightRef.current = true;
    requestControllerRef.current = controller;
    setIsLoading(true);
    setDetections(null);
    setError(null);

    try {
      const response = await analyzeImage(image, modelType, { signal: controller.signal });

      if (isMountedRef.current && requestControllerRef.current === controller) {
        setDetections(response.detections);
      }
    } catch (requestError) {
      if (isMountedRef.current && requestControllerRef.current === controller) {
        const message = mapAnalyzeErrorToMessage(requestError);

        if (message) {
          setError(message);
        }
      }
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        isRequestInFlightRef.current = false;

        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    isRequestInFlightRef.current = false;
    setIsLoading(false);
    setDetections(null);
    setError(null);
  }, []);

  return {
    analyze,
    clearAnalysis,
    detections,
    error,
    isLoading,
  } as const;
}
