import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {ReanimatedSwipeable} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProducts } from '../../hooks/useProducts';
import AppText from '../../components/common/AppText';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import ProductCard from '../../components/cards/ProductCard';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL } from '../../constants';
import type { RootStackParamList } from '../../navigation/types';
import type { Product } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FilterKey = 'all' | 'products' | 'services' | 'low_stock';

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'view-grid-outline' },
  { key: 'products', label: 'Products', icon: 'package-variant' },
  { key: 'services', label: 'Services', icon: 'briefcase-outline' },
  { key: 'low_stock', label: 'Low Stock', icon: 'alert-circle-outline' },
];

type SortKey = 'name' | 'price' | 'stock' | 'recent';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
];

function ProductSkeletonItem() {
  const theme = useTheme();
  return (
    <Surface style={[styles.skeletonCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <SkeletonLoader width={60} height={60} borderRadius={8} />
      <View style={styles.skeletonInfo}>
        <SkeletonLoader width="70%" height={16} />
        <SkeletonLoader width="40%" height={12} marginTop={6} />
        <SkeletonLoader width="30%" height={12} marginTop={4} />
      </View>
    </Surface>
  );
}

export default function ProductListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { products, isLoading, deleteProduct } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeSort, setActiveSort] = useState<SortKey>('recent');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)),
      );
    }

    switch (activeFilter) {
      case 'products':
        result = result.filter((p) => !p.isActive || p.stock !== null);
        break;
      case 'services':
        result = result.filter((p) => p.stock === null && p.isActive);
        break;
      case 'low_stock':
        result = result.filter(
          (p) =>
            p.stock !== null &&
            p.lowStockThreshold !== null &&
            p.stock <= p.lowStockThreshold,
        );
        break;
    }

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    switch (activeSort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock':
        result.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, searchQuery, activeFilter, activeSort, activeCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleDelete = useCallback(
    (product: Product) => {
      Alert.alert('Delete Product', `Are you sure you want to delete "${product.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
            } catch {}
          },
        },
      ]);
    },
    [deleteProduct],
  );

  const renderRightActions = useCallback(
    (product: Product) => (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('ProductEdit', { productId: product.id })}
        >
          <Icon name="pencil" size={20} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: theme.colors.error }]}
          onPress={() => handleDelete(product)}
        >
          <Icon name="delete" size={20} color={theme.colors.onError} />
        </TouchableOpacity>
      </View>
    ),
    [navigation, handleDelete, theme],
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ReanimatedSwipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        />
      </ReanimatedSwipeable>
    ),
    [navigation, renderRightActions],
  );

  const renderSkeleton = () => (
    <View>
      {[1, 2, 3, 4, 5].map((i) => (
        <ProductSkeletonItem key={i} />
      ))}
    </View>
  );

  const renderHeader = () => (
    <View>
      <SearchBar
        placeholder="Search products, SKU, category..."
        onSearch={setSearchQuery}
        value={searchQuery}
      />

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveFilter(item.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === item.key ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                  borderColor:
                    activeFilter === item.key ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Icon
                name={item.icon}
                size={16}
                color={activeFilter === item.key ? theme.colors.primary : theme.colors.textSecondary}
              />
              <AppText
                variant="labelMedium"
                color={activeFilter === item.key ? 'primary' : 'textSecondary'}
                style={styles.filterLabel}
              >
                {item.label}
              </AppText>
            </View>
          </TouchableOpacity>
        )}
      />

      {categories.length > 0 && (
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(activeCategory === item ? null : item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      activeCategory === item ? theme.colors.secondaryContainer : 'transparent',
                    borderColor:
                      activeCategory === item ? theme.colors.secondary : theme.colors.border,
                  },
                ]}
              >
                <AppText
                  variant="labelSmall"
                  color={activeCategory === item ? 'secondary' : 'textTertiary'}
                >
                  {item}
                </AppText>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.sortRow}>
        <AppText variant="labelMedium" color="textSecondary">
          {filteredProducts.length} items
        </AppText>
        <TouchableOpacity
          onPress={() => setShowSortSheet(!showSortSheet)}
          activeOpacity={0.7}
          style={styles.sortBtn}
        >
          <Icon name="sort" size={18} color={theme.colors.textSecondary} />
          <AppText variant="labelMedium" color="textSecondary" style={styles.sortLabel}>
            {SORT_OPTIONS.find((s) => s.key === activeSort)?.label}
          </AppText>
          <Icon name="chevron-down" size={16} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {showSortSheet && (
        <Surface style={[styles.sortSheet, { backgroundColor: theme.colors.surface }]} elevation={2}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => {
                setActiveSort(opt.key);
                setShowSortSheet(false);
              }}
              style={[
                styles.sortOption,
                {
                  backgroundColor:
                    activeSort === opt.key ? theme.colors.primaryContainer : 'transparent',
                },
              ]}
            >
              <AppText
                variant="bodyMedium"
                color={activeSort === opt.key ? 'primary' : 'textPrimary'}
              >
                {opt.label}
              </AppText>
              {activeSort === opt.key && (
                <Icon name="check" size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Surface>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return renderSkeleton();
    return (
      <EmptyState
        icon="package-variant-closed"
        title="No Products Found"
        subtitle={
          searchQuery
            ? `No products matching "${searchQuery}"`
            : 'Add your first product to get started'
        }
        actionLabel={!searchQuery ? 'Add Product' : undefined}
        onAction={!searchQuery ? () => navigation.navigate('ProductCreate') : undefined}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      <FloatingActionButton
        icon="plus"
        onPress={() => navigation.navigate('ProductCreate')}
        animated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  filterRow: { paddingVertical: 12, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterLabel: { marginLeft: 4 },
  categoryRow: { paddingVertical: 4, gap: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortLabel: { marginHorizontal: 4 },
  sortSheet: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  swipeActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  swipeAction: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  skeletonCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonInfo: { flex: 1, marginLeft: 12 },
});
