import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type ThemeColors, typography, useAppTheme } from '../theme';

interface SectionHeaderProps {
  step: number;
  title: string;
}

export function SectionHeader({ step, title }: SectionHeaderProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.step}>
        <Text style={styles.stepText}>{step}</Text>
      </View>
      <Text style={styles.title}>{title.replace(/^\d+\.\s*/, '')}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    step: {
      width: 28,
      height: 28,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    stepText: { ...typography.label, color: colors.onPrimary },
    title: { ...typography.title, color: colors.text },
  });
}
