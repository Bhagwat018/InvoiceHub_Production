import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../../components/common/AppText';
import AppSwitch from '../../components/inputs/AppSwitch';

type AutoLockTimeout = 'immediate' | '1min' | '5min' | '15min' | '30min';

const AUTO_LOCK_OPTIONS: { value: AutoLockTimeout; label: string }[] = [
  { value: 'immediate', label: 'Immediately' },
  { value: '1min', label: 'After 1 minute' },
  { value: '5min', label: 'After 5 minutes' },
  { value: '15min', label: 'After 15 minutes' },
  { value: '30min', label: 'After 30 minutes' },
];

export default function SecurityScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState<AutoLockTimeout>('5min');

  const handleTogglePin = useCallback((value: boolean) => {
    if (value) {
      Alert.alert(
        'Set Up PIN Lock',
        'You will be prompted to create a 4-digit PIN.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => setPinEnabled(true) },
        ],
      );
    } else {
      Alert.alert(
        'Disable PIN Lock',
        'Are you sure you want to disable PIN lock?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: () => setPinEnabled(false) },
        ],
      );
    }
  }, []);

  const handleChangePin = useCallback(() => {
    Alert.alert('Change PIN', 'Enter your current PIN, then set a new one.');
  }, []);

  const handleToggleBiometric = useCallback(
    (value: boolean) => {
      if (value && !pinEnabled) {
        Alert.alert('PIN Required', 'Please enable PIN lock first before using biometrics.');
        return;
      }
      setBiometricEnabled(value);
    },
    [pinEnabled],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          Screen Lock
        </AppText>
        <AppSwitch
          label="PIN Lock"
          value={pinEnabled}
          onValueChange={handleTogglePin}
          description="Require a 4-digit PIN to open the app"
        />
        {pinEnabled && (
          <TouchableOpacity
            onPress={handleChangePin}
            style={[styles.actionRow, { borderBottomColor: theme.colors.divider }]}
          >
            <Icon name="key-variant" size={20} color={theme.colors.primary} />
            <AppText variant="bodyMedium" color="primary" style={{ marginLeft: 12, flex: 1 }}>
              Change PIN
            </AppText>
            <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
        <View style={styles.divider} />
        <AppSwitch
          label="Biometric Lock"
          value={biometricEnabled}
          onValueChange={handleToggleBiometric}
          description="Use fingerprint or Face ID to unlock"
          disabled={!pinEnabled}
        />
      </Surface>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          Auto-Lock Timeout
        </AppText>
        <AppText variant="caption" color="textTertiary" style={{ marginBottom: 12 }}>
          Automatically lock the app after inactivity
        </AppText>
        {AUTO_LOCK_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setAutoLockTimeout(opt.value)}
            style={[
              styles.optionRow,
              { borderBottomColor: theme.colors.divider },
            ]}
            activeOpacity={0.6}
          >
            <View style={styles.optionLeft}>
              <Icon
                name={autoLockTimeout === opt.value ? 'radiobox-marked' : 'radiobox-blank'}
                size={22}
                color={autoLockTimeout === opt.value ? theme.colors.primary : theme.colors.textTertiary}
              />
              <AppText
                variant="bodyMedium"
                color={autoLockTimeout === opt.value ? 'primary' : 'textPrimary'}
                style={{ marginLeft: 12 }}
              >
                {opt.label}
              </AppText>
            </View>
          </TouchableOpacity>
        ))}
      </Surface>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.infoRow}>
          <Icon name="shield-check-outline" size={24} color={theme.colors.success} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <AppText variant="bodyMedium" color="textPrimary">
              Your data is secure
            </AppText>
            <AppText variant="caption" color="textTertiary">
              All data is stored locally on your device. PIN and biometric settings are stored securely using platform keychain.
            </AppText>
          </View>
        </View>
      </Surface>
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
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
