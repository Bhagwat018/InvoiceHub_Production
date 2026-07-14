import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from './AppText';

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: 'small' | 'medium' | 'large';
  colorIndex?: number;
}

const AVATAR_COLORS = [
  '#1E88E5',
  '#00897B',
  '#FB8C00',
  '#E53935',
  '#8E24AA',
  '#43A047',
  '#D81B60',
  '#039BE5',
  '#6D4C41',
  '#546E7A',
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function Avatar({
  name,
  image,
  size = 'medium',
  colorIndex = 0,
}: AvatarProps) {
  const theme = useTheme();
  const sizeMap = { small: 32, medium: 44, large: 64 };
  const fontSizeMap = { small: 12, medium: 16, large: 24 };

  const dimension = sizeMap[size];
  const bgColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={[
          styles.image,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <AppText
        variant="bodyMedium"
        color="textInverse"
        style={{ fontSize: fontSizeMap[size], fontWeight: '600' }}
      >
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#E0E0E0',
  },
});
