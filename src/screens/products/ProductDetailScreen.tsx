import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProducts } from '../../hooks/useProducts';
import AppText from '../../components/common/AppText';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL, UNIT_LABELS } from '../../constants';
import type { RootStackParamList } from '../../navigation/types';
import type { Product } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getProduct, deleteProduct, increaseStock, reduceStock } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProduct(route.params.productId);
        setProduct(data);
      } catch {} finally {
        setIsLoading(false);
      }
    };
    load();
  }, [route.params.productId, getProduct]);

  const handleDelete = useCallback(() => {
    if (!product) return;
    Alert.alert('Delete Product', `Are you sure you want to delete "${product.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            navigation.goBack();
          } catch {}
        },
      },
    ]);
  }, [product, deleteProduct, navigation]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    const lines = [
      product.name,
      product.sku ? `SKU: ${product.sku}` : '',
      `Price: ${CURRENCY_SYMBOL}${product.price.toLocaleString('en-IN')}`,
      product.stock !== null ? `Stock: ${product.stock}` : '',
      product.category ? `Category: ${product.category}` : '',
    ].filter(Boolean);
    await Share.share({ message: lines.join('\n') });
  }, [product]);

  const handleStockAdjust = useCallback(() => {
    if (!product) return;
    Alert.alert('Adjust Stock', `Current stock: ${product.stock ?? 0}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reduce',
        style: 'destructive',
        onPress: () => {
          Alert.prompt('Reduce Stock', 'Enter quantity to reduce', async (text) => {
            const qty = parseInt(text || '0', 10);
            if (qty > 0) {
              await reduceStock(product.id, qty);
              const updated = await getProduct(product.id);
              setProduct(updated);
            }
          });
        },
      },
      {
        text: 'Increase',
        onPress: () => {
          Alert.prompt('Increase Stock', 'Enter quantity to add', async (text) => {
            const qty = parseInt(text || '0', 10);
            if (qty > 0) {
              await increaseStock(product.id, qty);
              const updated = await getProduct(product.id);
              setProduct(updated);
            }
          });
        },
      },
    ]);
  }, [product, reduceStock, increaseStock, getProduct]);

  const profitMargin =
    product && product.costPrice && product.costPrice > 0
      ? (((product.price - product.costPrice) / product.costPrice) * 100).toFixed(1)
      : null;

  const isLowStock =
    product &&
    product.stock !== null &&
    product.lowStockThreshold !== null &&
    product.stock <= product.lowStockThreshold;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.padding}>
          <SkeletonLoader width="100%" height={200} borderRadius={12} />
          <SkeletonLoader width="60%" height={24} marginTop={16} />
          <SkeletonLoader width="40%" height={16} marginTop={8} />
          <SkeletonLoader width="100%" height={100} marginTop={16} borderRadius={12} />
        </View>
      </View>
    );
  }

  if (!product) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.imageSection, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon name="package-variant" size={80} color={theme.colors.textTertiary} />
        </View>

        <View style={styles.padding}>
          <View style={styles.nameRow}>
            <View style={styles.nameCol}>
              <AppText variant="h3" color="textPrimary">
                {product.name}
              </AppText>
              {product.sku && (
                <AppText variant="labelMedium" color="textTertiary" style={{ marginTop: 4 }}>
                  SKU: {product.sku}
                </AppText>
              )}
            </View>
            {isLowStock && <Badge status="overdue" label="Low Stock" />}
          </View>

          <View style={styles.priceRow}>
            <Surface style={[styles.priceCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <AppText variant="caption" color="textTertiary">
                Selling Price
              </AppText>
              <AppText variant="priceLarge" color="primary">
                {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
              </AppText>
            </Surface>
            {product.costPrice !== null && (
              <Surface style={[styles.priceCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <AppText variant="caption" color="textTertiary">
                  Purchase Price
                </AppText>
                <AppText variant="price" color="textPrimary">
                  {CURRENCY_SYMBOL}{product.costPrice.toLocaleString('en-IN')}
                </AppText>
              </Surface>
            )}
            {profitMargin && (
              <Surface style={[styles.priceCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <AppText variant="caption" color="textTertiary">
                  Margin
                </AppText>
                <AppText
                  variant="price"
                  style={{ color: parseFloat(profitMargin) >= 0 ? theme.colors.success : theme.colors.error }}
                >
                  {profitMargin}%
                </AppText>
              </Surface>
            )}
          </View>

          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
              Product Details
            </AppText>
            {product.barcode && (
              <InfoRow label="Barcode" value={product.barcode} theme={theme} />
            )}
            {product.hsnCode && (
              <InfoRow label="HSN Code" value={product.hsnCode} theme={theme} />
            )}
            {product.category && (
              <InfoRow label="Category" value={product.category} theme={theme} />
            )}
            <InfoRow
              label="Unit"
              value={UNIT_LABELS[product.unit] || product.unit}
              theme={theme}
            />
            <InfoRow label="Tax Rate" value={`${product.taxRate}%`} theme={theme} />
            {product.description && (
              <InfoRow label="Description" value={product.description} theme={theme} />
            )}
          </Surface>

          {product.stock !== null && (
            <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.stockHeader}>
                <AppText variant="h5" color="textPrimary">
                  Stock Information
                </AppText>
                <TouchableOpacity onPress={handleStockAdjust}>
                  <AppText variant="labelMedium" color="primary">
                    Adjust
                  </AppText>
                </TouchableOpacity>
              </View>
              <View style={styles.stockGrid}>
                <View style={styles.stockItem}>
                  <AppText variant="caption" color="textTertiary">
                    Current Stock
                  </AppText>
                  <AppText
                    variant="h3"
                    style={{ color: isLowStock ? theme.colors.error : theme.colors.textPrimary }}
                  >
                    {product.stock}
                  </AppText>
                </View>
                {product.lowStockThreshold !== null && (
                  <View style={styles.stockItem}>
                    <AppText variant="caption" color="textTertiary">
                      Low Stock Alert
                    </AppText>
                    <AppText variant="h3" color="textSecondary">
                      {product.lowStockThreshold}
                    </AppText>
                  </View>
                )}
              </View>
            </Surface>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.bottomAction, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={() => navigation.navigate('ProductEdit', { productId: product.id })}
        >
          <Icon name="pencil" size={20} color={theme.colors.primary} />
          <AppText variant="labelMedium" color="primary">
            Edit
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomAction, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handleShare}
        >
          <Icon name="share-variant" size={20} color={theme.colors.textSecondary} />
          <AppText variant="labelMedium" color="textSecondary">
            Share
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomAction, { backgroundColor: theme.colors.errorContainer }]}
          onPress={handleDelete}
        >
          <Icon name="delete" size={20} color={theme.colors.error} />
          <AppText variant="labelMedium" color="error">
            Delete
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={infoStyles.row}>
      <AppText variant="bodyMedium" color="textTertiary" style={infoStyles.label}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" color="textPrimary" style={infoStyles.value}>
        {value}
      </AppText>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  label: { flex: 1 },
  value: { flex: 1.5, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: 16 },
  imageSection: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  nameCol: { flex: 1, marginRight: 8 },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  priceCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  cardTitle: { marginBottom: 12 },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  stockItem: {},
  bottomBar: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 32,
    gap: 10,
    borderTopWidth: 1,
  },
  bottomAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
});
