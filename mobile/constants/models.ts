export type ModelType = 'detection';

export interface ModelOption {
  id: ModelType;
  label: string;
  description: string;
}

export const MODEL_OPTIONS: readonly ModelOption[] = [
  {
    id: 'detection',
    label: 'Detection',
    description: 'Görseldeki nesneleri ve güven oranlarını bulur.',
  },
] as const;
