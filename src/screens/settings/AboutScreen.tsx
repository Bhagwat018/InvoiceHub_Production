import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../../components/common/AppText';
import { APP_NAME, APP_VERSION } from '../../constants';

interface AboutLink {
  icon: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
}

export default function AboutScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const openURL = (url: string) => Linking.openURL(url).catch(() => {});

  const links: AboutLink[] = [
    {
      icon: 'star-outline',
      iconColor: '#FFB300',
      label: 'Rate App',
      subtitle: 'Rate us on the Play Store',
      onPress: () => {
        const storeUrl = Platform.OS === 'ios'
          ? 'itms-apps://itunes.apple.com/app/id000000000'
          : 'market://details?id=com.invoicehub';
        openURL(storeUrl);
      },
    },
    {
      icon: 'shield-lock-outline',
      iconColor: '#4CAF50',
      label: 'Privacy Policy',
      onPress: () => openURL('https://invoicehub.app/privacy'),
    },
    {
      icon: 'text-box-outline',
      iconColor: '#2196F3',
      label: 'Terms of Service',
      onPress: () => openURL('https://invoicehub.app/terms'),
    },
    {
      icon: 'email-outline',
      iconColor: '#E53935',
      label: 'Support',
      subtitle: 'support@invoicehub.app',
      onPress: () => openURL('mailto:support@invoicehub.app'),
    },
    {
      icon: 'code-braces',
      iconColor: '#9C27B0',
      label: 'Open Source Licenses',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon name="file-document-edit" size={48} color={theme.colors.primary} />
        </View>
        <AppText variant="h3" color="textPrimary" style={{ marginTop: 16 }}>
          {APP_NAME}
        </AppText>
        <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: 4 }}>
          Professional Invoicing Made Simple
        </AppText>
        <View style={[styles.versionBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
          <AppText variant="labelMedium" color="textSecondary">
            Version {APP_VERSION}
          </AppText>
        </View>
      </View>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
          DEVELOPER
        </AppText>
        <View style={styles.devInfo}>
          <AppText variant="bodyMedium" color="textPrimary">
            InvoiceHub Technologies
          </AppText>
          <AppText variant="caption" color="textTertiary">
            Built with care for small businesses
          </AppText>
        </View>
      </Surface>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            onPress={link.onPress}
            activeOpacity={0.6}
            style={[
              styles.linkRow,
              index < links.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.divider,
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${link.iconColor}12` }]}>
              <Icon name={link.icon} size={20} color={link.iconColor} />
            </View>
            <View style={styles.linkContent}>
              <AppText variant="bodyMedium" color="textPrimary">
                {link.label}
              </AppText>
              {link.subtitle && (
                <AppText variant="caption" color="textTertiary">
                  {link.subtitle}
                </AppText>
              )}
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </Surface>

      <AppText variant="caption" color="textTertiary" align="center" style={styles.footer}>
        Made in India for Indian Businesses
      </AppText>
      <AppText variant="caption" color="textTertiary" align="center">
        {APP_NAME} {APP_VERSION}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    letterSpacing: 1,
  },
  devInfo: {
    gap: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
    marginRight: 8,
  },
  footer: {
    marginTop: 24,
    marginBottom: 4,
  },
});
