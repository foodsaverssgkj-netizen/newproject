import { View, Text, StyleSheet, TouchableOpacity, Modal as RNModal, ViewStyle } from 'react-native';
import { colors, spacing, radii, typography } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export function Modal({ visible, onClose, title, children, footer, style }: ModalProps) {
  return (
    <RNModal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheet, style]}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.body}>{children}</View>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </View>
    </RNModal>
  );
}

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger,
}: ConfirmDialogProps) {
  return (
    <RNModal transparent visible={visible} onRequestClose={onCancel} animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onCancel} activeOpacity={1} />
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity style={[styles.dialogBtn, styles.dialogCancel]} onPress={onCancel}>
              <Text style={styles.dialogCancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dialogBtn, danger ? styles.dialogDanger : styles.dialogConfirm]}
              onPress={onConfirm}
            >
              <Text style={styles.dialogConfirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11,31,58,0.45)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    ...shadows.header,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  closeBtn: {
    fontSize: 18,
    color: colors.text.tertiary,
  },
  body: {
    padding: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.header,
  },
  dialogTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  dialogMessage: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  dialogBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancel: {
    backgroundColor: colors.neutral[100],
  },
  dialogCancelText: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  dialogConfirm: {
    backgroundColor: colors.blue[500],
  },
  dialogDanger: {
    backgroundColor: colors.error[500],
  },
  dialogConfirmText: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    color: colors.neutral.white,
  },
});
