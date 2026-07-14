import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import AppText from '../common/AppText';
import { CURRENCY_SYMBOL } from '../../constants';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <View
          style={[
            styles.imageContainer,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <AppText variant="h3" color="textTertiary">
            {product.name.charAt(0)}
          </AppText>
        </View>
        <View style={styles.info}>
          <AppText variant="bodyLarge" color="textPrimary" numberOfLines={1}>
            {product.name}
          </AppText>
          <AppText variant="price" color="primary">
            {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
          </AppText>
          {product.stock !== null && (
            <AppText
              variant="caption"
              style={{
                color:
                  product.stock <= (product.lowStockThreshold || 0)
                    ? theme.colors.error
                    : theme.colors.textTertiary,
              }}
            >
              Stock: {product.stock}
            </AppText>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
});
