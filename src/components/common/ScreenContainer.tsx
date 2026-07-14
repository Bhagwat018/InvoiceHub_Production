import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAvoid?: boolean;
  safeArea?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  contentContainerStyle?: object;
}

export default function ScreenContainer({
  children,
  scroll = false,
  keyboardAvoid = true,
  safeArea = true,
  padded = true,
  backgroundColor,
  contentContainerStyle,
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = scroll ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        padded && styles.paddedContent,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[padded && styles.paddedContent, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || theme.colors.background,
          paddingTop: safeArea ? insets.top : 0,
        },
      ]}
      behavior={keyboardAvoid ? Platform.OS === 'ios' ? 'padding' : 'height' : undefined}
      keyboardVerticalOffset={0}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  paddedContent: {
    padding: 16,
  },
});
