import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ModelOption } from '../constants/models';
import { radius, spacing, type ThemeColors, typography, useAppTheme } from '../theme';
import type { ModelType } from '../types/api';

interface ModelSelectorProps {
  models: readonly ModelOption[];
  selectedModel: ModelType | null;
  disabled?: boolean;
  onSelect: (model: ModelType) => void;
}

export function ModelSelector({
  models,
  selectedModel,
  disabled = false,
  onSelect,
}: ModelSelectorProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.list}>
      {models.map((model) => {
        const selected = selectedModel === model.id;
        return (
          <Pressable
            key={model.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            disabled={disabled}
            onPress={() => onSelect(model.id)}
            style={[styles.option, selected && styles.optionSelected, disabled && styles.disabled]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.dot} /> : null}
            </View>
            <View style={styles.copy}>
              <Text style={styles.label}>{model.label}</Text>
              <Text style={styles.description}>{model.description}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MVP</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    list: { gap: spacing.sm },
    option: {
      minHeight: 78,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    disabled: { opacity: 0.55 },
    radio: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.textMuted,
      borderRadius: radius.pill,
    },
    radioSelected: { borderColor: colors.primary },
    dot: {
      width: 10,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    copy: { flex: 1 },
    label: { ...typography.label, color: colors.text },
    description: { ...typography.caption, marginTop: spacing.xs, color: colors.textMuted },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: colors.onPrimary },
  });
}
