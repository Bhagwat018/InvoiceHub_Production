import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import SkeletonLoader from './SkeletonLoader';

export default function InvoiceSkeleton() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.header}>
        <SkeletonLoader width={80} height={16} />
        <SkeletonLoader width={60} height={20} borderRadius={12} />
      </View>
      <SkeletonLoader width="40%" height={14} />
      <View style={styles.footer}>
        <SkeletonLoader width={100} height={18} />
        <SkeletonLoader width={70} height={14} />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
