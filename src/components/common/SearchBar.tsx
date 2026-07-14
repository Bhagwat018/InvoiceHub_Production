import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SearchBarProps extends TextInputProps {
  onSearch?: (query: string) => void;
  debounceMs?: number;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  debounceMs = 300,
  placeholder = 'Search...',
  value: controlledValue,
  onChangeText: controlledOnChangeText,
  ...props
}: SearchBarProps) {
  const theme = useTheme();
  const [internalValue, setInternalValue] = useState('');

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  const handleChangeText = useCallback(
    (text: string) => {
      if (controlledOnChangeText) {
        controlledOnChangeText(text);
      } else {
        setInternalValue(text);
      }
    },
    [controlledOnChangeText]
  );

  const handleClear = useCallback(() => {
    handleChangeText('');
  }, [handleChangeText]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Icon name="magnify" size={20} color={theme.colors.textTertiary} />
      <TextInput
        style={[styles.input, { color: theme.colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inputPlaceholder}
        value={value}
        onChangeText={handleChangeText}
        returnKeyType="search"
        autoCorrect={false}
        {...props}
      />
      {value.length > 0 && (
        <Icon
          name="close-circle"
          size={18}
          color={theme.colors.textTertiary}
          onPress={handleClear}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
    paddingVertical: 0,
  },
});
