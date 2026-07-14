import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import DateTimePicker from '../../stubs/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface DateInputProps {
  label?: string;
  value: Date | null;
  onChangeDate: (date: Date) => void;
  error?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DateInput({
  label,
  value,
  onChangeDate,
  error,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
}: DateInputProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChangeDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="labelMedium" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.trigger,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: error ? theme.colors.error : theme.colors.inputBorder,
            },
          ]}
        >
          <Icon name="calendar" size={20} color={theme.colors.textTertiary} />
          <AppText
            variant="bodyMedium"
            color={value ? 'textPrimary' : 'textTertiary'}
            style={styles.value}
          >
            {value ? formatDate(value) : placeholder}
          </AppText>
        </View>
      </TouchableOpacity>
      {error && (
        <AppText variant="caption" color="error" style={styles.error}>
          {error}
        </AppText>
      )}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  value: {
    marginLeft: 8,
    flex: 1,
  },
  error: {
    marginTop: 4,
  },
});
