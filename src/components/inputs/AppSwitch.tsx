import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from '../common/AppText';

interface AppSwitchProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export default function AppSwitch({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
}: AppSwitchProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
      style={styles.container}
    >
      <View style={styles.textContainer}>
        {label && (
          <AppText variant="bodyMedium" color="textPrimary">
            {label}
          </AppText>
        )}
        {description && (
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        )}
      </View>
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? theme.colors.primary : theme.colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateX: value ? 20 : 0 }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});
