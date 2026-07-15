import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSettingsStore } from '../../storage/stores/settingsStore';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import AppText from '../../components/common/AppText';
import type { MoreStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MoreStackParamList, 'Settings'>;

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  icon: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { colors } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const currency = useSettingsStore((s) => s.currency);
  const language = useSettingsStore((s) => s.language);
  const dateFormat = useSettingsStore((s) => s.dateFormat);
  const notifications = useSettingsStore((s) => s.notifications);

  const themeLabel = themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light';

  const sections: SettingsSection[] = [
    {
      title: 'Business',
      items: [
        {
          icon: 'office-building-outline',
          iconColor: colors.primary,
          label: 'Business Profile',
          subtitle: 'Logo, name, GST, PAN, address, bank details',
          onPress: () => navigation.navigate('BusinessProfile'),
        },
        {
          icon: 'file-document-edit-outline',
          iconColor: colors.secondary,
          label: 'Invoice Settings',
          subtitle: 'Prefix, number, terms, notes',
          onPress: () => navigation.navigate('InvoiceSettings' as any),
        },
        {
          icon: 'percent',
          iconColor: colors.accent,
          label: 'Tax Settings',
          subtitle: 'GST type, tax rate, HSN code',
          onPress: () => navigation.navigate('TaxSettings'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'palette-outline',
          iconColor: '#9C27B0',
          label: 'Appearance',
          subtitle: `Theme: ${themeLabel}`,
          onPress: () => {},
        },
        {
          icon: 'currency-inr',
          iconColor: '#FF9800',
          label: 'Currency & Locale',
          subtitle: `${currency} · ${language.toUpperCase()} · ${dateFormat}`,
          onPress: () => {},
        },
        {
          icon: 'bell-outline',
          iconColor: '#F44336',
          label: 'Notifications',
          subtitle: notifications.invoiceReminders ? 'Enabled' : 'Disabled',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: 'shield-lock-outline',
          iconColor: '#607D8B',
          label: 'Security',
          subtitle: 'PIN lock, biometrics, auto-lock',
          onPress: () => navigation.navigate('Security' as any),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: 'cloud-upload-outline',
          iconColor: '#2196F3',
          label: 'Backup & Restore',
          subtitle: 'Google Drive backup, auto backup',
          onPress: () => navigation.navigate('Backup'),
        },
        {
          icon: 'import-export',
          iconColor: '#795548',
          label: 'Import/Export',
          subtitle: 'Export as CSV/JSON, Import from CSV',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-outline',
          iconColor: '#4CAF50',
          label: 'About',
          subtitle: 'Version, policies, support',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  const renderSection = (section: SettingsSection, sectionIndex: number) => (
    <View key={sectionIndex} style={styles.section}>
      <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
        {section.title}
      </AppText>
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        {section.items.map((item, itemIndex) => (
          <TouchableOpacity
            key={itemIndex}
            onPress={item.onPress}
            activeOpacity={0.6}
            style={[
              styles.settingsItem,
              itemIndex < section.items.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.divider,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${item.iconColor}12` },
              ]}
            >
              <Icon name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemLabelRow}>
                <AppText variant="bodyMedium" color="textPrimary">
                  {item.label}
                </AppText>
                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <AppText variant="caption" color="textInverse">
                      {item.badge}
                    </AppText>
                  </View>
                )}
              </View>
              {item.subtitle && (
                <AppText variant="caption" color="textTertiary" numberOfLines={1}>
                  {item.subtitle}
                </AppText>
              )}
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </Surface>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => renderSection(section, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
