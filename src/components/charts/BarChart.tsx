import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, useEffect } from 'react-native-reanimated';
import AppText from '../common/AppText';

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  maxValue?: number;
  barColor?: string;
  height?: number;
}

export default function BarChart({
  data,
  maxValue,
  barColor,
  height = 200,
}: BarChartProps) {
  const theme = useTheme();
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const barBgColor = barColor || theme.colors.primary;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const barHeight = max > 0 ? (item.value / max) * (height - 40) : 0;
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: barBgColor,
                      borderRadius: 4,
                    },
                  ]}
                />
              </View>
              <AppText variant="caption" color="textTertiary" align="center" style={styles.label}>
                {item.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '60%',
  },
  bar: {
    width: '100%',
  },
  label: {
    marginTop: 8,
  },
});
