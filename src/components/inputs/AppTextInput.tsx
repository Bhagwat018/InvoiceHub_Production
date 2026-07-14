import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  prefix?: string;
  suffix?: string;
}

export default function AppTextInput({
  label,
  error,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  style,
  ...props
}: AppTextInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? theme.colors.error
    : isFocused
    ? theme.colors.inputBorderFocused
    : theme.colors.inputBorder;

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="labelMedium" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor,
          },
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
            style={styles.leftIcon}
          />
        )}
        {prefix && (
          <AppText variant="bodyMedium" color="textSecondary" style={styles.prefix}>
            {prefix}
          </AppText>
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {suffix && (
          <AppText variant="bodyMedium" color="textSecondary" style={styles.suffix}>
            {suffix}
          </AppText>
        )}
        {rightIcon && (
          <Icon
            name={rightIcon}
            size={20}
            color={theme.colors.textTertiary}
            style={styles.rightIcon}
          />
        )}
      </View>
      {error && (
        <AppText variant="caption" color="error" style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  prefix: {
    marginRight: 4,
  },
  suffix: {
    marginLeft: 4,
  },
  error: {
    marginTop: 4,
  },
});
