import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  icon?: string;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  icon = 'alert-circle-outline',
}: ConfirmModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: destructive ? theme.colors.errorContainer : theme.colors.primaryContainer,
              },
            ]}
          >
            <Icon
              name={icon}
              size={32}
              color={destructive ? theme.colors.error : theme.colors.primary}
            />
          </View>
          <AppText variant="h4" color="textPrimary" align="center" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="bodyMedium" color="textSecondary" align="center" style={styles.message}>
            {message}
          </AppText>
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              {cancelLabel}
            </Button>
            <Button
              mode="contained"
              onPress={onConfirm}
              buttonColor={destructive ? theme.colors.error : theme.colors.primary}
              style={styles.confirmButton}
            >
              {confirmLabel}
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});
