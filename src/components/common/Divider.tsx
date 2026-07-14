import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface DividerProps {
  vertical?: boolean;
  inset?: boolean;
  thickness?: number;
}

export default function Divider({
  vertical = false,
  inset = false,
  thickness = 1,
}: DividerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        {
          backgroundColor: theme.colors.divider,
          thickness,
        },
        inset && (vertical ? styles.insetVertical : styles.insetHorizontal),
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
  },
  insetHorizontal: {
    marginLeft: 16,
    marginRight: 16,
  },
  insetVertical: {
    marginTop: 16,
    marginBottom: 16,
  },
});
