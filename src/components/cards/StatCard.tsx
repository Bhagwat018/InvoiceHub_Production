import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}

export default function StatCard({
  icon,
  value,
  label,
  trend,
  color,
}: StatCardProps) {
  const theme = useTheme();
  const accentColor = color || theme.colors.primary;

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${accentColor}15` },
        ]}
      >
        <Icon name={icon} size={22} color={accentColor} />
      </View>
      <AppText variant="h3" color="textPrimary" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="bodySmall" color="textSecondary">
        {label}
      </AppText>
      {trend && (
        <View style={styles.trendRow}>
          <Icon
            name={trend.isPositive ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend.isPositive ? theme.colors.success : theme.colors.error}
          />
          <AppText
            variant="labelSmall"
            style={{
              color: trend.isPositive ? theme.colors.success : theme.colors.error,
              marginLeft: 4,
            }}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </AppText>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
