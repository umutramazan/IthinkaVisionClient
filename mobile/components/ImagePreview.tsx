import { StyleSheet, Text, View } from 'react-native';

import { messages } from '../constants/messages';
import { radius, spacing, type ThemeColors, typography, useAppTheme } from '../theme';

interface ImagePreviewProps {
  hasImage: boolean;
  sourceLabel?: string;
}

export function ImagePreview({ hasImage, sourceLabel }: ImagePreviewProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[styles.preview, hasImage && styles.previewReady]}
      accessibilityLabel={hasImage ? messages.previewReady : messages.previewEmpty}
    >
      <View style={[styles.artwork, hasImage && styles.artworkReady]}>
        <Text style={[styles.artworkIcon, hasImage && styles.artworkIconReady]}>
          {hasImage ? '✓' : '◇'}
        </Text>
      </View>
      <Text style={styles.title}>{hasImage ? messages.previewReady : messages.previewEmpty}</Text>
      {sourceLabel ? <Text style={styles.caption}>{sourceLabel}</Text> : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    preview: {
      minHeight: 150,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceMuted,
    },
    previewReady: {
      borderStyle: 'solid',
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    artwork: {
      width: 52,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    artworkReady: { backgroundColor: colors.primary },
    artworkIcon: { fontSize: 25, color: colors.primaryDark },
    artworkIconReady: { color: colors.onPrimary },
    title: { ...typography.label, color: colors.text },
    caption: { ...typography.caption, color: colors.textMuted },
  });
}
