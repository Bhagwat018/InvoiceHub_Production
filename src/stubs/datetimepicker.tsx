import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '../components/common/AppText';

interface DateTimePickerProps {
  value: Date;
  mode?: string;
  display?: string;
  onChange?: (event: any, date?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const handleChange = () => {
    if (onChange) {
      onChange({ type: 'set' }, value);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChange} style={styles.button}>
        <AppText variant="bodyMedium" color="textPrimary">
          {value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  button: { padding: 12, alignItems: 'center' },
});
