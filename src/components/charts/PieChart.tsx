import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Path, G } from 'react-native-svg';
import AppText from '../common/AppText';

interface PieChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  size?: number;
}

const PIE_COLORS = [
  '#1E88E5',
  '#00897B',
  '#FB8C00',
  '#E53935',
  '#8E24AA',
  '#43A047',
  '#D81B60',
  '#039BE5',
];

export default function PieChart({ data, size = 200 }: PieChartProps) {
  const theme = useTheme();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const radius = size / 2 - 10;

  const segments = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const startAngle = data
      .slice(0, index)
      .reduce((sum, d) => sum + (total > 0 ? d.value / total : 0), 0) * Math.PI * 2;
    const endAngle = startAngle + percentage * Math.PI * 2;

    const x1 = center + radius * Math.cos(startAngle - Math.PI / 2);
    const y1 = center + radius * Math.sin(startAngle - Math.PI / 2);
    const x2 = center + radius * Math.cos(endAngle - Math.PI / 2);
    const y2 = center + radius * Math.sin(endAngle - Math.PI / 2);

    const largeArcFlag = percentage > 0.5 ? 1 : 0;

    const pathD = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    return {
      pathD,
      color: item.color || PIE_COLORS[index % PIE_COLORS.length],
      label: item.label,
      percentage,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((segment, index) => (
            <Path key={index} d={segment.pathD} fill={segment.color} />
          ))}
        </G>
      </Svg>
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <AppText variant="caption" color="textSecondary">
              {segment.label} ({Math.round(segment.percentage * 100)}%)
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
});
