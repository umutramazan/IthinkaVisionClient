import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorDialog } from '../components/ErrorDialog';
import { ImagePreview } from '../components/ImagePreview';
import { ImageSourceButtons } from '../components/ImageSourceButtons';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ModelSelector } from '../components/ModelSelector';
import { ResultCard } from '../components/ResultCard';
import { SectionHeader } from '../components/SectionHeader';
import { messages } from '../constants/messages';
import { MODEL_OPTIONS, type ModelType } from '../constants/models';
import { radius, spacing, type ThemeColors, typography, useAppTheme } from '../theme';
import type { Detection } from '../types/detection';
import type { PickedImage } from '../types/image';
import { groupDetections } from '../utils/detectionViewModel';
import { ImageOptimizationError, optimizeImage } from '../utils/imageOptimizer';
import {
  pickImageFromCamera,
  pickImageFromLibrary,
  recoverPendingImagePick,
} from '../utils/imagePicker';

type DemoScenario = 'success' | 'empty' | 'error';

const DEMO_DETECTIONS: readonly Detection[] = [
  { class: 'Person', confidence: 0.96 },
  { class: 'Helmet', confidence: 0.91 },
  { class: 'Person', confidence: 0.89 },
];

const scenarios: readonly { id: DemoScenario; label: string }[] = [
  { id: 'success', label: 'Başarılı' },
  { id: 'empty', label: 'Boş' },
  { id: 'error', label: 'Hata' },
];

function mapImageError(error: unknown, fallbackMessage: string) {
  return error instanceof ImageOptimizationError
    ? messages.imageOptimizationError
    : fallbackMessage;
}

export function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<PickedImage | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [scenario, setScenario] = useState<DemoScenario>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [detections, setDetections] = useState<readonly Detection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const groupedResults = useMemo(() => groupDetections(detections ?? []), [detections]);

  const applyPickedImage = useCallback((image: PickedImage, source: string) => {
    setImageSource(source);
    setSelectedImage(image);
    setDetections(null);
    setError(null);
  }, []);

  const optimizeAndApplyImage = useCallback(
    async (image: PickedImage, source: string) => {
      const optimizedImage = await optimizeImage(image);
      applyPickedImage(optimizedImage, source);
    },
    [applyPickedImage],
  );

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    let isActive = true;

    recoverPendingImagePick()
      .then((outcome) => {
        if (isActive && outcome?.status === 'selected') {
          return optimizeAndApplyImage(outcome.image, messages.gallery);
        }

        return undefined;
      })
      .catch((error: unknown) => {
        if (isActive) {
          setError(mapImageError(error, messages.pendingImageError));
        }
      });

    return () => {
      isActive = false;
    };
  }, [optimizeAndApplyImage]);

  async function handleCameraPress() {
    setIsPickingImage(true);
    setError(null);

    try {
      const outcome = await pickImageFromCamera();

      if (outcome.status === 'canceled') {
        return;
      }

      if (outcome.status === 'permission-denied') {
        setError(
          outcome.canAskAgain ? messages.cameraPermissionDenied : messages.cameraPermissionBlocked,
        );
        return;
      }

      await optimizeAndApplyImage(outcome.image, messages.camera);
    } catch (error) {
      setError(mapImageError(error, messages.cameraError));
    } finally {
      setIsPickingImage(false);
    }
  }

  async function handleGalleryPress() {
    setIsPickingImage(true);
    setError(null);

    try {
      const outcome = await pickImageFromLibrary();

      if (outcome.status === 'selected') {
        await optimizeAndApplyImage(outcome.image, messages.gallery);
      }
    } catch (error) {
      setError(mapImageError(error, messages.galleryError));
    } finally {
      setIsPickingImage(false);
    }
  }

  function analyze() {
    if (!imageSource) {
      setError(messages.imageRequired);
      return;
    }
    if (!selectedModel) {
      setError(messages.modelRequired);
      return;
    }

    setIsLoading(true);
    setDetections(null);
    setTimeout(() => {
      setIsLoading(false);
      if (scenario === 'error') {
        setError(messages.genericError);
      } else {
        setDetections(scenario === 'success' ? DEMO_DETECTIONS : []);
      }
    }, 700);
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{messages.appName}</Text>
          <Text style={styles.heroTitle}>{messages.heroTitle}</Text>
          <Text style={styles.heroDescription}>{messages.heroDescription}</Text>
        </View>

        <View style={styles.section}>
          <SectionHeader step={1} title={messages.chooseImage} />
          <ImageSourceButtons
            disabled={isLoading || isPickingImage}
            onCameraPress={handleCameraPress}
            onGalleryPress={handleGalleryPress}
          />
          <ImagePreview
            hasImage={imageSource !== null}
            imageUri={selectedImage?.uri}
            sourceLabel={
              imageSource && selectedImage
                ? `${imageSource} · ${selectedImage.width} × ${selectedImage.height}`
                : (imageSource ?? undefined)
            }
          />
        </View>

        <View style={styles.section}>
          <SectionHeader step={2} title={messages.chooseModel} />
          <ModelSelector
            models={MODEL_OPTIONS}
            selectedModel={selectedModel}
            disabled={isLoading || isPickingImage}
            onSelect={setSelectedModel}
          />
        </View>

        <View style={styles.demoPanel}>
          <Text style={styles.demoLabel}>{messages.demoScenario}</Text>
          <View style={styles.scenarioRow}>
            {scenarios.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isLoading || isPickingImage,
                  selected: scenario === item.id,
                }}
                disabled={isLoading || isPickingImage}
                onPress={() => setScenario(item.id)}
                style={[styles.scenarioChip, scenario === item.id && styles.scenarioChipSelected]}
              >
                <Text
                  style={[styles.scenarioText, scenario === item.id && styles.scenarioTextSelected]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading || isPickingImage }}
          disabled={isLoading || isPickingImage}
          onPress={analyze}
          style={({ pressed }) => [
            styles.analyzeButton,
            pressed && styles.pressed,
            isLoading && styles.disabled,
          ]}
        >
          <Text style={styles.analyzeButtonText}>{messages.analyze}</Text>
          <Text style={styles.analyzeArrow}>→</Text>
        </Pressable>

        {detections !== null ? (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>{messages.results}</Text>
            {groupedResults.length > 0 ? (
              <View style={styles.resultsList}>
                {groupedResults.map((result) => (
                  <ResultCard key={result.className} result={result} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>○</Text>
                <Text style={styles.emptyTitle}>{messages.noResults}</Text>
                <Text style={styles.emptyDescription}>{messages.noResultsDescription}</Text>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
      <ErrorDialog message={error} onClose={() => setError(null)} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xxl,
      paddingBottom: 80,
    },
    header: { paddingVertical: spacing.md },
    eyebrow: {
      ...typography.label,
      color: colors.primary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    heroTitle: { ...typography.hero, maxWidth: 560, marginTop: spacing.sm, color: colors.text },
    heroDescription: {
      ...typography.body,
      maxWidth: 580,
      marginTop: spacing.sm,
      color: colors.textMuted,
    },
    section: { gap: spacing.md, marginTop: spacing.xl },
    demoPanel: {
      gap: spacing.sm,
      marginTop: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    demoLabel: { ...typography.caption, fontWeight: '600', color: colors.textMuted },
    scenarioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    scenarioChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
    },
    scenarioChipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    scenarioText: { ...typography.caption, color: colors.text },
    scenarioTextSelected: { color: colors.onPrimary, fontWeight: '600' },
    analyzeButton: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
    },
    analyzeButtonText: { ...typography.body, fontWeight: '700', color: colors.onPrimary },
    analyzeArrow: { fontSize: 22, color: colors.onPrimary },
    pressed: { opacity: 0.78 },
    disabled: { opacity: 0.5 },
    resultsSection: { gap: spacing.md, marginTop: spacing.xl },
    resultsTitle: { ...typography.title, color: colors.text },
    resultsList: { gap: spacing.sm },
    emptyCard: {
      alignItems: 'center',
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    emptyIcon: { fontSize: 36, color: colors.textMuted },
    emptyTitle: {
      ...typography.title,
      marginTop: spacing.sm,
      color: colors.text,
      textAlign: 'center',
    },
    emptyDescription: {
      ...typography.body,
      marginTop: spacing.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
