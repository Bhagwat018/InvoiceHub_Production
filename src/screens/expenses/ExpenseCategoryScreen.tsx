import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useExpenses } from '../../hooks/useExpenses';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import AppTextInput from '../../components/inputs/AppTextInput';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/modals/ConfirmModal';
import SkeletonLoader from '../../components/loading/SkeletonLoader';

const CATEGORY_ICONS = [
  'office-building', 'flash', 'account-group', 'printer', 'car',
  'bullhorn', 'briefcase', 'tools', 'laptop', 'wrench',
  'shield-check', 'calculator', 'dots-horizontal', 'help-circle',
  'cart', 'gift', 'heart', 'star', 'home', 'coffee',
  'food', 'plane', 'train', 'bus', 'bike',
  'phone', 'wifi', 'television', 'music', 'camera',
];

const CATEGORY_COLORS = [
  '#1E88E5', '#00897B', '#FB8C00', '#E53935', '#8E24AA',
  '#43A047', '#D81B60', '#039BE5', '#F4511E', '#6D4C41',
  '#546E7A', '#7CB342', '#C0CA33', '#FFB300', '#00ACC1',
];

interface ExpenseCategoryItem {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

function CategorySkeleton() {
  const theme = useTheme();
  return (
    <Surface style={[styles.skeletonCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.skeletonContent}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.skeletonInfo}>
          <SkeletonLoader width={120} height={16} />
        </View>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
      </View>
    </Surface>
  );
}

export default function ExpenseCategoryScreen() {
  const theme = useTheme();

  const { getAllCategories, createCategory } = useExpenses();

  const [categories, setCategories] = useState<ExpenseCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('dots-horizontal');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategoryItem | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllCategories();
      setCategories(data as unknown as ExpenseCategoryItem[]);
    } catch {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [getAllCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setSelectedIcon('dots-horizontal');
    setSelectedColor(CATEGORY_COLORS[0]);
    setModalVisible(true);
  };

  const openEditModal = (category: ExpenseCategoryItem) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedIcon(category.icon || 'dots-horizontal');
    setSelectedColor(category.color || CATEGORY_COLORS[0]);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    try {
      await createCategory({
        name: categoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setModalVisible(false);
      fetchCategories();
    } catch {
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const handleDeleteCategory = (category: ExpenseCategoryItem) => {
    if (category.isDefault) {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted');
      return;
    }
    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const renderCategoryItem = ({ item }: { item: ExpenseCategoryItem }) => (
    <Surface style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={[styles.categoryIcon, { backgroundColor: `${item.color || theme.colors.primary}15` }]}>
        <Icon
          name={item.icon || 'dots-horizontal'}
          size={22}
          color={item.color || theme.colors.primary}
        />
      </View>
      <View style={styles.categoryInfo}>
        <AppText variant="bodyMedium" color="textPrimary">
          {item.name}
        </AppText>
        {item.isDefault && (
          <AppText variant="caption" color="textTertiary">Default</AppText>
        )}
      </View>
      <TouchableOpacity
        onPress={() => openEditModal(item)}
        style={styles.editButton}
      >
        <Icon name="pencil" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      {!item.isDefault && (
        <TouchableOpacity
          onPress={() => handleDeleteCategory(item)}
          style={styles.deleteButton}
        >
          <Icon name="delete-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </Surface>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <CategorySkeleton key={i} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="tag-outline"
      title="No Categories"
      subtitle="Add expense categories to organize your expenses"
      actionLabel="Add Category"
      onAction={openAddModal}
    />
  );

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Expense Categories"
        actions={[{ icon: 'plus', onPress: openAddModal }]}
      />

      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <View style={styles.modalHeader}>
              <AppText variant="h4" color="textPrimary">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </AppText>
              <Icon name="close" size={24} color={theme.colors.textSecondary} onPress={() => setModalVisible(false)} />
            </View>

            <ScrollView style={styles.modalBody}>
              <AppTextInput
                label="Category Name"
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Enter category name"
                leftIcon="tag"
              />

              <AppText variant="labelMedium" color="textSecondary" style={styles.sectionLabel}>
                Icon
              </AppText>
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: selectedIcon === icon
                          ? theme.colors.primaryContainer
                          : theme.colors.surfaceVariant,
                        borderColor: selectedIcon === icon ? theme.colors.primary : 'transparent',
                      },
                    ]}
                  >
                    <Icon
                      name={icon}
                      size={22}
                      color={selectedIcon === icon ? theme.colors.primary : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <AppText variant="labelMedium" color="textSecondary" style={styles.sectionLabel}>
                Color
              </AppText>
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderColor: selectedColor === color ? theme.colors.textPrimary : 'transparent',
                      },
                    ]}
                  >
                    {selectedColor === color && (
                      <Icon name="check" size={16} color={theme.colors.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSaveCategory} style={styles.saveButton}>
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          setDeleteModalVisible(false);
          setCategoryToDelete(null);
        }}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCategoryToDelete(null);
        }}
        destructive
        icon="tag-remove"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
