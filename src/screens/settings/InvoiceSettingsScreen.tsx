import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../hooks/useSettings';
import AppText from '../../components/common/AppText';
import AppTextInput from '../../components/inputs/AppTextInput';
import AppSwitch from '../../components/inputs/AppSwitch';
import { INVOICE_PREFIX_DEFAULT } from '../../constants';

type PaymentTerm = 'Net 15' | 'Net 30' | 'Net 60' | 'Due on Receipt';

export default function InvoiceSettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { business, print, setBusiness, setPrint } = useSettings();

  const [prefix, setPrefix] = useState(business.invoicePrefix || INVOICE_PREFIX_DEFAULT);
  const [startNumber, setStartNumber] = useState(String(business.invoiceStartNumber || 1));
  const [resetYearly, setResetYearly] = useState(false);
  const [terms, setTerms] = useState(business.defaultNotes || '');
  const [notes, setNotes] = useState('');
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>(
    (business.defaultPaymentTerms as PaymentTerm) || 'Net 30',
  );
  const [showLogo, setShowLogo] = useState(print.showLogo);
  const [showSignature, setShowSignature] = useState(print.showSignature);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const paymentTermOptions: PaymentTerm[] = ['Net 15', 'Net 30', 'Net 60', 'Due on Receipt'];

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      setBusiness({
        invoicePrefix: prefix,
        invoiceStartNumber: Number(startNumber) || 1,
        defaultPaymentTerms: paymentTerm,
        defaultNotes: notes,
      });
      setPrint({
        showLogo,
        showSignature,
      });
      Alert.alert('Success', 'Invoice settings saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save invoice settings.');
    } finally {
      setIsSaving(false);
    }
  }, [prefix, startNumber, paymentTerm, notes, showLogo, showSignature, setBusiness, setPrint, navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          Invoice Numbering
        </AppText>
        <AppTextInput
          label="Invoice Prefix"
          value={prefix}
          onChangeText={setPrefix}
          leftIcon="tag-outline"
          placeholder={INVOICE_PREFIX_DEFAULT}
          maxLength={10}
          autoCapitalize="characters"
        />
        <AppTextInput
          label="Starting Number"
          value={startNumber}
          onChangeText={setStartNumber}
          leftIcon="numeric"
          keyboardType="numeric"
          placeholder="1"
        />
        <AppSwitch
          label="Reset number every year"
          value={resetYearly}
          onValueChange={setResetYearly}
          description="Restart numbering at 1 each financial year"
        />
        <View style={[styles.previewBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <AppText variant="caption" color="textTertiary">
            Preview
          </AppText>
          <AppText variant="invoiceNumber" color="textPrimary" style={{ marginTop: 4 }}>
            {prefix}-{String(startNumber || 1).padStart(4, '0')}
          </AppText>
        </View>
      </Surface>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          Default Payment Terms
        </AppText>
        <View style={styles.termGrid}>
          {paymentTermOptions.map((term) => (
            <Button
              key={term}
              mode={paymentTerm === term ? 'contained' : 'outlined'}
              onPress={() => setPaymentTerm(term)}
              style={[
                styles.termButton,
                paymentTerm !== term && { borderColor: theme.colors.border },
              ]}
              labelStyle={{
                color: paymentTerm === term ? theme.colors.onPrimary : theme.colors.textPrimary,
                fontSize: 13,
              }}
              contentStyle={{ paddingVertical: 4 }}
            >
              {term}
            </Button>
          ))}
        </View>
      </Surface>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          Default Notes
        </AppText>
        <AppText variant="caption" color="textTertiary" style={{ marginBottom: 8 }}>
          Shown on every invoice
        </AppText>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add default notes..."
          placeholderTextColor={theme.colors.inputPlaceholder}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={[
            styles.textArea,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        />
      </Surface>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          Terms & Conditions
        </AppText>
        <AppText variant="caption" color="textTertiary" style={{ marginBottom: 8 }}>
          Shown at the bottom of invoice PDF
        </AppText>
        <TextInput
          value={terms}
          onChangeText={setTerms}
          placeholder="Enter terms and conditions..."
          placeholderTextColor={theme.colors.inputPlaceholder}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[
            styles.textArea,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        />
      </Surface>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          PDF Options
        </AppText>
        <AppSwitch
          label="Show business logo"
          value={showLogo}
          onValueChange={setShowLogo}
          description="Display logo on invoice PDF"
        />
        <AppSwitch
          label="Show signature"
          value={showSignature}
          onValueChange={setShowSignature}
          description="Display signature on invoice PDF"
        />
        <AppSwitch
          label="Show QR code"
          value={showQrCode}
          onValueChange={setShowQrCode}
          description="Include UPI QR code for payment"
        />
      </Surface>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={isSaving}
        disabled={isSaving}
        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
        labelStyle={{ color: theme.colors.onPrimary, fontWeight: '600' }}
        contentStyle={{ paddingVertical: 6 }}
      >
        Save Invoice Settings
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
  previewBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  termGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  termButton: {
    borderRadius: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 8,
  },
});
