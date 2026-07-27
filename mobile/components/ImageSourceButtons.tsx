import { Pressable, StyleSheet, Text, View } from 'react-native';

import { messages } from '../constants/messages';
import { radius, spacing, type ThemeColors, typography, useAppTheme } from '../theme';

interface ImageSourceButtonsProps {
  disabled?: boolean;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

export function ImageSourceButtons({
  disabled = false,
  onCameraPress,
  onGalleryPress,
}: ImageSourceButtonsProps) {
  return (
    <View style={structuralStyles.row}>
      <SourceButton icon="◎" label={messages.camera} disabled={disabled} onPress={onCameraPress} />
      <SourceButton
        icon="▧"
        label={messages.gallery}
        disabled={disabled}
        onPress={onGalleryPress}
      />
    </View>
  );
}

interface SourceButtonProps {
  icon: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

function SourceButton({ icon, label, disabled, onPress }: SourceButtonProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const structuralStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      minHeight: 58,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    pressed: { opacity: 0.72 },
    disabled: { opacity: 0.45 },
    icon: { fontSize: 23, color: colors.primaryDark },
    label: { ...typography.label, color: colors.primaryDark },
  });
}
