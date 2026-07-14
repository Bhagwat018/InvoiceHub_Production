import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppViewProps extends ViewProps {
  safeArea?: boolean;
  padded?: boolean;
  centered?: boolean;
  fill?: boolean;
}

export default function AppView({
  safeArea = false,
  padded = false,
  centered = false,
  fill = false,
  style,
  children,
  ...props
}: AppViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        { backgroundColor: theme.colors.background },
        safeArea && {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        padded && { padding: theme.spacing[4] },
        centered && { alignItems: 'center', justifyContent: 'center' },
        fill && { flex: 1 },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
