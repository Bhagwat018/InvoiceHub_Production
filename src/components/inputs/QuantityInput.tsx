import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface QuantityInputProps {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function QuantityInput({
  label,
  value,
  onChangeValue,
  min = 0,
  max = 9999,
  step = 1,
}: QuantityInputProps) {
  const theme = useTheme();

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChangeValue(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChangeValue(newValue);
  };

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="labelMedium" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surfaceVariant,
              opacity: value <= min ? 0.5 : 1,
            },
          ]}
        >
          <Icon name="minus" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View
          style={[
            styles.valueContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <AppText variant="h4" color="textPrimary" align="center">
            {value}
          </AppText>
        </View>
        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.primaryContainer,
              opacity: value >= max ? 0.5 : 1,
            },
          ]}
        >
          <Icon name="plus" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
});
