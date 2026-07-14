import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSection {
  title: string;
  key: string;
  options: FilterOption[];
  multi?: boolean;
}

interface FilterModalProps {
  visible: boolean;
  sections: FilterSection[];
  activeFilters: Record<string, string | string[]>;
  onApply: (filters: Record<string, string | string[]>) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function FilterModal({
  visible,
  sections,
  activeFilters,
  onApply,
  onClear,
  onClose,
}: FilterModalProps) {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<Record<string, string | string[]>>(activeFilters);

  const handleToggle = (sectionKey: string, value: string, multi = false) => {
    setLocalFilters((prev) => {
      if (multi) {
        const current = (prev[sectionKey] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [sectionKey]: updated };
      }
      return { ...prev, [sectionKey]: value };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
    onClose();
  };

  const isSelected = (sectionKey: string, value: string, multi = false) => {
    if (multi) {
      return ((localFilters[sectionKey] as string[]) || []).includes(value);
    }
    return localFilters[sectionKey] === value;
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
              Filters
            </AppText>
            <Icon name="close" size={24} color={theme.colors.textSecondary} onPress={onClose} />
          </View>

          <ScrollView style={styles.content}>
            {sections.map((section) => (
              <View key={section.key} style={styles.section}>
                <AppText variant="labelLarge" color="textPrimary" style={styles.sectionTitle}>
                  {section.title}
                </AppText>
                <View style={styles.optionsGrid}>
                  {section.options.map((option) => {
                    const selected = isSelected(section.key, option.value, section.multi);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleToggle(section.key, option.value, section.multi)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                            borderColor: selected ? theme.colors.primary : theme.colors.border,
                          },
                        ]}
                      >
                        <AppText
                          variant="labelMedium"
                          color={selected ? 'primary' : 'textSecondary'}
                        >
                          {option.label}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Button mode="outlined" onPress={handleClear} style={styles.clearButton}>
              Clear All
            </Button>
            <Button mode="contained" onPress={handleApply} style={styles.applyButton}>
              Apply Filters
            </Button>
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  clearButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
});
