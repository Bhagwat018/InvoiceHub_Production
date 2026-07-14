import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';

interface AnimatedHeaderProps {
  title: string;
  scrollY: Animated.SharedValue<number>;
  children?: React.ReactNode;
  actions?: Array<{
    icon: string;
    onPress: () => void;
  }>;
}

export default function AnimatedHeader({
  title,
  scrollY,
  children,
  actions,
}: AnimatedHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [0, 1], Extrapolate.CLAMP),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 80], [20, 0], Extrapolate.CLAMP),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: theme.colors.background },
          headerStyle,
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Animated.View style={titleStyle}>
              <AppText variant="h4" color="textPrimary" numberOfLines={1}>
                {title}
              </AppText>
            </Animated.View>
          </View>
          {actions && (
            <View style={styles.headerActions}>
              {actions.map((action, index) => (
                <Icon
                  key={index}
                  name={action.icon}
                  size={22}
                  color={theme.colors.textPrimary}
                  onPress={action.onPress}
                  style={styles.headerAction}
                />
              ))}
            </View>
          )}
        </View>
      </Animated.View>

      <View style={styles.floatingHeader}>
        <View style={styles.floatingContent}>
          <Icon
            name="arrow-left"
            size={24}
            color={theme.colors.textPrimary}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.floatingSpacer} />
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    marginLeft: 16,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  floatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  floatingSpacer: {
    flex: 1,
  },
});
