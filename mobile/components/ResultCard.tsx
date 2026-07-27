import { StyleSheet, Text, View } from 'react-native';

import { messages } from '../constants/messages';
import { radius, spacing, type ThemeColors, typography, useAppTheme } from '../theme';
import type { DetectionGroup } from '../types/detection';
import { formatConfidence } from '../utils/detectionViewModel';

interface ResultCardProps {
  result: DetectionGroup;
}

export function ResultCard({ result }: ResultCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.initial}>
        <Text style={styles.initialText}>{result.className.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.className}>{result.className}</Text>
        {result.count > 1 ? (
          <Text style={styles.count}>
            {result.count} {messages.count}
          </Text>
        ) : null}
      </View>
      <View style={styles.confidence}>
        <Text style={styles.confidenceValue}>{formatConfidence(result.confidence)}</Text>
        <Text style={styles.confidenceLabel}>{messages.confidence}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    initial: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: colors.successSoft,
    },
    initialText: { ...typography.title, color: colors.success },
    content: { flex: 1 },
    className: { ...typography.label, color: colors.text },
    count: { ...typography.caption, color: colors.textMuted },
    confidence: { alignItems: 'flex-end' },
    confidenceValue: { ...typography.title, color: colors.success },
    confidenceLabel: { ...typography.caption, color: colors.textMuted },
  });
}
