import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import AppText from '../common/AppText';

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  lineColor?: string;
  dotColor?: string;
  height?: number;
}

export default function LineChart({
  data,
  lineColor,
  dotColor,
  height = 200,
}: LineChartProps) {
  const theme = useTheme();
  const stroke = lineColor || theme.colors.primary;
  const fill = dotColor || theme.colors.primary;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 300;

  const getPoints = () => {
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return data.map((item, index) => ({
      x: padding + (index / (data.length - 1 || 1)) * chartWidth,
      y: padding + chartHeight - (item.value / maxValue) * chartHeight,
    }));
  };

  const points = getPoints();
  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={pathD} stroke={stroke} strokeWidth={2} fill="none" />
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={fill}
          />
        ))}
      </Svg>
      <View style={styles.labels}>
        {data.map((item, index) => (
          <AppText key={index} variant="caption" color="textTertiary" align="center">
            {item.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
});
