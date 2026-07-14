import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from './AppText';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'file-document-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Icon name={icon} size={48} color={theme.colors.textTertiary} />
      </View>
      <AppText
        variant="h4"
        color="textSecondary"
        align="center"
        style={styles.title}
      >
        {title}
      </AppText>
      {subtitle && (
        <AppText
          variant="bodyMedium"
          color="textTertiary"
          align="center"
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
