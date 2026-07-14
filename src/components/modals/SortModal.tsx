import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface SortOption {
  label: string;
  value: string;
  icon?: string;
}

interface SortModalProps {
  visible: boolean;
  options: SortOption[];
  currentValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function SortModal({
  visible,
  options,
  currentValue,
  onSelect,
  onClose,
}: SortModalProps) {
  const theme = useTheme();

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <View style={styles.header}>
            <AppText variant="h4" color="textPrimary">
              Sort By
            </AppText>
            <Icon name="close" size={24} color={theme.colors.textSecondary} onPress={onClose} />
          </View>

          <View style={styles.options}>
            {options.map((option) => {
              const isSelected = option.value === currentValue;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? theme.colors.primaryContainer : 'transparent',
                    },
                  ]}
                >
                  <Icon
                    name={option.icon || 'sort'}
                    size={20}
                    color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <AppText
                    variant="bodyLarge"
                    color={isSelected ? 'primary' : 'textPrimary'}
                    style={styles.optionText}
                  >
                    {option.label}
                  </AppText>
                  {isSelected && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  options: {
    paddingTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
});
