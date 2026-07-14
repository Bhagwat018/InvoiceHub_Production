import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from '../common/AppText';
import { CURRENCY_SYMBOL } from '../../constants';

interface AmountInputProps {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  error?: string;
  prefix?: string;
  placeholder?: string;
  editable?: boolean;
}

export default function AmountInput({
  label,
  value,
  onChangeValue,
  error,
  prefix = CURRENCY_SYMBOL,
  placeholder = '0.00',
  editable = true,
}: AmountInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(cleaned) || 0;
    onChangeValue(numericValue);
  };

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
        <AppText variant="price" color="textSecondary" style={styles.prefix}>
          {prefix}
        </AppText>
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          value={value > 0 ? value.toFixed(2) : ''}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
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
  prefix: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
  },
  error: {
    marginTop: 4,
  },
});
