import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from './AppText';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.errorContainer },
        ]}
      >
        <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
      </View>
      <AppText variant="h4" color="textPrimary" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodyMedium" color="textSecondary" align="center" style={styles.message}>
        {message}
      </AppText>
      {onRetry && (
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          Try Again
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
  message: {
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
