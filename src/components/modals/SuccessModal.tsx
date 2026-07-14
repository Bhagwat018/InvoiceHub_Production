import React, { useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import AppText from '../common/AppText';

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttonLabel?: string;
  onDone: () => void;
  icon?: string;
}

export default function SuccessModal({
  visible,
  title = 'Success!',
  message = 'Operation completed successfully.',
  buttonLabel = 'Done',
  onDone,
  icon = 'check-circle',
}: SuccessModalProps) {
  const theme = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withDelay(200, withSpring(1, { damping: 8 }));
      opacity.value = withDelay(400, withSpring(1));
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible, scale, opacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDone}
    >
      <View style={styles.overlay}>
        <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <Animated.View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.successContainer },
              iconStyle,
            ]}
          >
            <Icon name={icon} size={48} color={theme.colors.success} />
          </Animated.View>
          <Animated.View style={textStyle}>
            <AppText variant="h3" color="textPrimary" align="center" style={styles.title}>
              {title}
            </AppText>
            <AppText variant="bodyMedium" color="textSecondary" align="center" style={styles.message}>
              {message}
            </AppText>
          </Animated.View>
          <Button mode="contained" onPress={onDone} style={styles.button}>
            {buttonLabel}
          </Button>
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
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
});
