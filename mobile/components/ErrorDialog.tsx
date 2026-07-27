import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { messages } from '../constants/messages';
import { radius, spacing, type ThemeColors, typography, useAppTheme } from '../theme';

interface ErrorDialogProps {
  message: string | null;
  onClose: () => void;
}

export function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Modal transparent visible={message !== null} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop} accessibilityViewIsModal>
        <View style={styles.dialog}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>İşlem tamamlanamadı</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>{messages.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      backgroundColor: colors.overlay,
    },
    dialog: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    icon: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: colors.dangerSoft,
    },
    iconText: { ...typography.title, color: colors.danger },
    title: {
      ...typography.title,
      marginTop: spacing.md,
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      ...typography.body,
      marginTop: spacing.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    button: {
      width: '100%',
      alignItems: 'center',
      marginTop: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
    },
    buttonText: { ...typography.label, color: colors.onPrimary },
  });
}
