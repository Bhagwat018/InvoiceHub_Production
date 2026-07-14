import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  onSelect: (value: string) => void;
}

export default function AppSelect({
  label,
  value,
  options,
  placeholder = 'Select...',
  error,
  onSelect,
}: AppSelectProps) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleSelect = (item: SelectOption) => {
    onSelect(item.value);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="labelMedium" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
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
          <AppText
            variant="bodyMedium"
            color={selectedLabel ? 'textPrimary' : 'textTertiary'}
          >
            {selectedLabel || placeholder}
          </AppText>
          <Icon name="chevron-down" size={20} color={theme.colors.textTertiary} />
        </View>
      </TouchableOpacity>
      {error && (
        <AppText variant="caption" color="error" style={styles.error}>
          {error}
        </AppText>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <Surface style={[styles.modal, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <View style={styles.modalHeader}>
              <AppText variant="h5" color="textPrimary">
                {label || 'Select'}
              </AppText>
              <Icon
                name="close"
                size={24}
                color={theme.colors.textSecondary}
                onPress={() => setIsVisible(false)}
              />
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.option,
                    {
                      backgroundColor:
                        item.value === value ? theme.colors.primaryContainer : 'transparent',
                    },
                  ]}
                >
                  <AppText
                    variant="bodyMedium"
                    color={item.value === value ? 'primary' : 'textPrimary'}
                  >
                    {item.label}
                  </AppText>
                  {item.value === value && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Surface>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  error: {
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
