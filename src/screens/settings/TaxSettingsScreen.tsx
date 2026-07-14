import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSettings } from '../../hooks/useSettings';
import AppText from '../../components/common/AppText';
import AppTextInput from '../../components/inputs/AppTextInput';
import AppSwitch from '../../components/inputs/AppSwitch';
import { GST_RATES } from '../../constants';

type RoundOffMode = 'up' | 'down' | 'nearest';

export default function TaxSettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { tax, setTax } = useSettings();

  const [gstRegistered, setGstRegistered] = useState(tax.gstRegistered);
  const [gstType, setGstType] = useState<'CGST_SGST' | 'IGST'>(tax.isIgstApplicable ? 'IGST' : 'CGST_SGST');
  const [gstRate, setGstRate] = useState(String(tax.gstRate));
  const [hsnCode, setHsnCode] = useState(tax.hsnCode);
  const [sacCode, setSacCode] = useState(tax.sacCode);
  const [cessEnabled, setCessEnabled] = useState(false);
  const [cessRate, setCessRate] = useState('0');
  const [tcsEnabled, setTcsEnabled] = useState(false);
  const [tcsRate, setTcsRate] = useState('0');
  const [roundOff, setRoundOff] = useState<RoundOffMode>('nearest');
  const [isSaving, setIsSaving] = useState(false);

  const roundOffOptions: { value: RoundOffMode; label: string; icon: string }[] = [
    { value: 'up', label: 'Round Up', icon: 'arrow-up-bold' },
    { value: 'down', label: 'Round Down', icon: 'arrow-down-bold' },
    { value: 'nearest', label: 'Nearest', icon: 'equal' },
  ];

  const handleRateSelect = (rate: number) => {
    setGstRate(String(rate));
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const rate = Number(gstRate) || 0;
      setTax({
        gstRegistered,
        gstRate: rate,
        isIgstApplicable: gstType === 'IGST',
        cgstRate: gstType === 'CGST_SGST' ? rate / 2 : 0,
        sgstRate: gstType === 'CGST_SGST' ? rate / 2 : 0,
        igstRate: gstType === 'IGST' ? rate : 0,
        hsnCode,
        sacCode,
      });
      Alert.alert('Success', 'Tax settings saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save tax settings.');
    } finally {
      setIsSaving(false);
    }
  }, [gstRegistered, gstType, gstRate, hsnCode, sacCode, setTax, navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppSwitch
          label="GST Registered"
          value={gstRegistered}
          onValueChange={setGstRegistered}
          description="Enable GST on invoices"
        />
      </Surface>

      {gstRegistered && (
        <>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
              GST Type
            </AppText>
            <View style={styles.typeRow}>
              {(['CGST_SGST', 'IGST'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setGstType(type)}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: gstType === type ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                      borderColor: gstType === type ? theme.colors.primary : 'transparent',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={gstType === type ? 'radiobox-marked' : 'radiobox-blank'}
                    size={22}
                    color={gstType === type ? theme.colors.primary : theme.colors.textTertiary}
                  />
                  <View style={{ marginLeft: 8 }}>
                    <AppText
                      variant="bodyMedium"
                      color={gstType === type ? 'primary' : 'textPrimary'}
                    >
                      {type === 'CGST_SGST' ? 'CGST + SGST' : 'IGST'}
                    </AppText>
                    <AppText variant="caption" color="textTertiary">
                      {type === 'CGST_SGST' ? 'Intra-state' : 'Inter-state'}
                    </AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
              Default Tax Rate
            </AppText>
            <View style={styles.rateGrid}>
              {GST_RATES.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  onPress={() => handleRateSelect(rate)}
                  style={[
                    styles.rateOption,
                    {
                      backgroundColor: gstRate === String(rate) ? theme.colors.primary : theme.colors.surfaceVariant,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <AppText
                    variant="labelLarge"
                    color={gstRate === String(rate) ? 'textInverse' : 'textPrimary'}
                  >
                    {rate}%
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
            <AppTextInput
              label="Custom Rate"
              value={gstRate}
              onChangeText={setGstRate}
              keyboardType="numeric"
              suffix="%"
              placeholder="Enter custom rate"
            />
            {gstRegistered && (
              <View style={styles.splitPreview}>
                {gstType === 'CGST_SGST' ? (
                  <AppText variant="bodySmall" color="textSecondary">
                    CGST: {(Number(gstRate) / 2).toFixed(1)}% + SGST: {(Number(gstRate) / 2).toFixed(1)}%
                  </AppText>
                ) : (
                  <AppText variant="bodySmall" color="textSecondary">
                    IGST: {gstRate}%
                  </AppText>
                )}
              </View>
            )}
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
              Additional Taxes
            </AppText>
            <AppSwitch
              label="Enable CESS"
              value={cessEnabled}
              onValueChange={setCessEnabled}
              description="Add CESS to invoices"
            />
            {cessEnabled && (
              <AppTextInput
                label="CESS Rate"
                value={cessRate}
                onChangeText={setCessRate}
                keyboardType="numeric"
                suffix="%"
                placeholder="0"
              />
            )}
            <View style={styles.divider} />
            <AppSwitch
              label="Enable TCS"
              value={tcsEnabled}
              onValueChange={setTcsEnabled}
              description="Tax Collected at Source"
            />
            {tcsEnabled && (
              <AppTextInput
                label="TCS Rate"
                value={tcsRate}
                onChangeText={setTcsRate}
                keyboardType="numeric"
                suffix="%"
                placeholder="0"
              />
            )}
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
              HSN / SAC Code
            </AppText>
            <AppTextInput
              label="Default HSN Code"
              value={hsnCode}
              onChangeText={setHsnCode}
              leftIcon="barcode"
              placeholder="Enter HSN code"
            />
            <AppTextInput
              label="SAC Code (Services)"
              value={sacCode}
              onChangeText={setSacCode}
              leftIcon="tag-outline"
              placeholder="Enter SAC code"
            />
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
              Round Off
            </AppText>
            <View style={styles.roundOffRow}>
              {roundOffOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setRoundOff(opt.value)}
                  style={[
                    styles.roundOffOption,
                    {
                      backgroundColor: roundOff === opt.value ? theme.colors.primary : theme.colors.surfaceVariant,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={opt.icon}
                    size={18}
                    color={roundOff === opt.value ? theme.colors.onPrimary : theme.colors.textSecondary}
                  />
                  <AppText
                    variant="labelMedium"
                    color={roundOff === opt.value ? 'textInverse' : 'textSecondary'}
                    style={{ marginTop: 4 }}
                  >
                    {opt.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        </>
      )}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={isSaving}
        disabled={isSaving}
        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
        labelStyle={{ color: theme.colors.onPrimary, fontWeight: '600' }}
        contentStyle={{ paddingVertical: 6 }}
      >
        Save Tax Settings
      </Button>
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
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  rateOption: {
    width: 64,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitPreview: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 136, 229, 0.08)',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  roundOffRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roundOffOption: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 8,
  },
});
