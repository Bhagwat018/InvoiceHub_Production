import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface FloatingActionButtonProps {
  icon?: string;
  onPress: () => void;
  color?: string;
  size?: number;
  animated?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FloatingActionButton({
  icon = 'plus',
  onPress,
  color,
  size = 56,
  animated = true,
}: FloatingActionButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [animated, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const backgroundColor = color || theme.colors.primary;

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          shadowColor: backgroundColor,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={icon} size={24} color={theme.colors.onPrimary} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
