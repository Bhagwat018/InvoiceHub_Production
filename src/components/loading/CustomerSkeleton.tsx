import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import SkeletonLoader from './SkeletonLoader';

export default function CustomerSkeleton() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.row}>
        <SkeletonLoader width={44} height={44} borderRadius={22} />
        <View style={styles.info}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} />
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
  },
});
