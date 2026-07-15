import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  message = 'Loading...',
  fullScreen = true,
}: LoadingStateProps) {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: '#FAFAFA' },
      ]}
    >
      <ActivityIndicator size="large" color="#1E88E5" />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: '#666666',
  },
});
