import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme, Surface, Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TabItemProps {
  icon: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  color: string;
}

function TabItem({ icon, label, focused, onPress, color }: TabItemProps) {
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.1 : 1) }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      style={[styles.tabItem, animatedStyle]}
      activeOpacity={0.7}
    >
      <Icon
        name={icon}
        size={24}
        color={focused ? theme.colors.primary : theme.colors.textTertiary}
      />
      <Text
        variant="labelSmall"
        style={[
          styles.tabLabel,
          {
            color: focused ? theme.colors.primary : theme.colors.textTertiary,
          },
        ]}
      >
        {label}
      </Text>
      {focused && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      )}
    </AnimatedTouchable>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabs = state.routes;

  return (
    <Surface style={[styles.container, { paddingBottom: insets.bottom }]} elevation={8}>
      <View style={styles.tabBarContent}>
        {tabs.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const isCreateButton = route.name === 'CreateInvoice';

          if (isCreateButton) {
            return (
              <AnimatedTouchable
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={[
                  styles.fabContainer,
                  {
                    backgroundColor: theme.colors.primary,
                    top: -24,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  },
                ]}
              >
                <Icon name="plus" size={28} color={theme.colors.onPrimary} />
              </AnimatedTouchable>
            );
          }

          const getIconName = () => {
            switch (route.name) {
              case 'Dashboard':
                return 'view-dashboard';
              case 'Customers':
                return 'account-group';
              case 'Invoices':
                return 'file-document';
              case 'More':
                return 'dots-horizontal';
              default:
                return 'circle';
            }
          };

          return (
            <TabItem
              key={route.key}
              icon={getIconName()}
              label={options.tabBarLabel as string}
              focused={focused}
              onPress={() => navigation.navigate(route.name)}
              color={theme.colors.primary}
            />
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 10,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 3,
    borderRadius: 1.5,
  },
  fabContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
