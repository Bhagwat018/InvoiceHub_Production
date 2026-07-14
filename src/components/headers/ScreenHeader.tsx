import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: Array<{
    icon: string;
    onPress: () => void;
    color?: string;
  }>;
}

export default function ScreenHeader({
  title,
  showBack = true,
  actions,
}: ScreenHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <Surface style={[styles.container, { paddingTop: insets.top }]} elevation={1}>
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <AppText variant="h4" color="textPrimary" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        {actions ? (
          <View style={styles.actions}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                style={styles.actionButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon
                  name={action.icon}
                  size={22}
                  color={action.color || theme.colors.textPrimary}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
  spacer: {
    width: 32,
  },
});
