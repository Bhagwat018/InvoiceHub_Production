import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdService } from '../ads/AdService';
import AppText from '../components/common/AppText';

interface BannerAdProps {
  style?: object;
  position?: 'bottom' | 'top';
}

export default function BannerAd({ style, position = 'bottom' }: BannerAdProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!AdService.isBannerEnabled()) {
    return null;
  }

  // In production, use:
  // import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
  // <BannerAd unitId={AdService.getBannerAdUnitId()} size={BannerAdSize.ADAPTIVE_BANNER} />

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          paddingBottom: position === 'bottom' ? insets.bottom : 0,
          paddingTop: position === 'top' ? insets.top : 0,
        },
        style,
      ]}
    >
      <View style={styles.adPlaceholder}>
        <AppText variant="caption" color="textTertiary">
          Ad Space
        </AppText>
        <AppText variant="overline" color="textDisabled">
          {Platform.OS === 'ios' ? 'iOS' : 'Android'} Banner
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  adPlaceholder: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
