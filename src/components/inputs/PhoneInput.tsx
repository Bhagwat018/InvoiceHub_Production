import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from '../common/AppText';

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeValue: (value: string) => void;
  error?: string;
  countryCode?: string;
}

export default function PhoneInput({
  label,
  value,
  onChangeValue,
  error,
  countryCode = '+91',
}: PhoneInputProps) {
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
        <TouchableOpacity style={styles.countryCode}>
          <AppText variant="bodyMedium" color="textSecondary">
            {countryCode}
          </AppText>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          value={value}
          onChangeText={onChangeValue}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          placeholderTextColor={theme.colors.inputPlaceholder}
          maxLength={10}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
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
  countryCode: {
    paddingVertical: 12,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  error: {
    marginTop: 4,
  },
});
