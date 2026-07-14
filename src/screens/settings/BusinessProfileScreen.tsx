import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from '../../stubs/react-native-image-picker';
import { useSettings } from '../../hooks/useSettings';
import AppText from '../../components/common/AppText';
import AppTextInput from '../../components/inputs/AppTextInput';
import { INDIAN_STATES, GST_NUMBER_REGEX, PAN_NUMBER_REGEX } from '../../constants';

export default function BusinessProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { business, setBusiness } = useSettings();

  const [form, setForm] = useState({ ...business });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateField = useCallback(
    (field: string, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Business name is required';
    if (form.gstNumber && !GST_NUMBER_REGEX.test(form.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST number format';
    }
    if (form.panNumber && !PAN_NUMBER_REGEX.test(form.panNumber)) {
      newErrors.panNumber = 'Invalid PAN number format';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }
    setIsSaving(true);
    try {
      setBusiness({
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        website: form.website,
        gstNumber: form.gstNumber,
        panNumber: form.panNumber,
        logo: form.logo,
        bankName: form.bankName,
        bankAccountNumber: form.bankAccountNumber,
        bankIfsc: form.bankIfsc,
        bankBranch: form.bankBranch,
        upiId: form.upiId,
      });
      Alert.alert('Success', 'Business profile saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save business profile.');
    } finally {
      setIsSaving(false);
    }
  }, [form, setBusiness, validate, navigation]);

  const handleLogoUpload = useCallback(() => {
    Alert.alert('Update Logo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 512, maxHeight: 512 }, (res) => {
            if (res.assets?.[0]?.uri) updateField('logo', res.assets[0].uri);
          });
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 512, maxHeight: 512 }, (res) => {
            if (res.assets?.[0]?.uri) updateField('logo', res.assets[0].uri);
          });
        },
      },
      { text: 'Remove Logo', style: 'destructive', onPress: () => updateField('logo', '') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [updateField]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={handleLogoUpload} style={styles.logoContainer}>
          {form.logo ? (
            <Image source={{ uri: form.logo }} style={styles.logoImage} />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Icon name="camera-plus-outline" size={32} color={theme.colors.textTertiary} />
              <AppText variant="caption" color="textTertiary" style={{ marginTop: 4 }}>
                Add Logo
              </AppText>
            </View>
          )}
        </TouchableOpacity>

        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
            Business Information
          </AppText>
          <AppTextInput
            label="Business Name *"
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            error={errors.name}
            leftIcon="office-building-outline"
            placeholder="Enter business name"
          />
          <AppTextInput
            label="Email"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            error={errors.email}
            leftIcon="email-outline"
            keyboardType="email-address"
            placeholder="business@example.com"
          />
          <AppTextInput
            label="Phone"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            leftIcon="phone-outline"
            keyboardType="phone-pad"
            placeholder="+91 98765 43210"
          />
          <AppTextInput
            label="Website"
            value={form.website}
            onChangeText={(v) => updateField('website', v)}
            leftIcon="web"
            placeholder="www.example.com"
          />
        </Surface>

        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
            Address
          </AppText>
          <AppTextInput
            label="Address"
            value={form.address}
            onChangeText={(v) => updateField('address', v)}
            leftIcon="map-marker-outline"
            placeholder="Street address"
          />
          <AppTextInput
            label="City"
            value={form.city}
            onChangeText={(v) => updateField('city', v)}
            leftIcon="city-variant-outline"
            placeholder="City"
          />
          <AppTextInput
            label="State"
            value={form.state}
            onChangeText={(v) => updateField('state', v)}
            leftIcon="map-outline"
            placeholder="State"
          />
          <AppTextInput
            label="Pincode"
            value={form.pincode}
            onChangeText={(v) => updateField('pincode', v)}
            leftIcon="pin-outline"
            keyboardType="numeric"
            maxLength={6}
            placeholder="000000"
          />
        </Surface>

        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
            Tax Details
          </AppText>
          <AppTextInput
            label="GST Number"
            value={form.gstNumber}
            onChangeText={(v) => updateField('gstNumber', v.toUpperCase())}
            error={errors.gstNumber}
            leftIcon="receipt"
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
            autoCapitalize="characters"
          />
          <AppTextInput
            label="PAN Number"
            value={form.panNumber}
            onChangeText={(v) => updateField('panNumber', v.toUpperCase())}
            error={errors.panNumber}
            leftIcon="card-account-details-outline"
            placeholder="ABCDE1234F"
            maxLength={10}
            autoCapitalize="characters"
          />
        </Surface>

        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
            Bank Details
          </AppText>
          <AppTextInput
            label="Bank Name"
            value={form.bankName}
            onChangeText={(v) => updateField('bankName', v)}
            leftIcon="bank-outline"
            placeholder="Bank name"
          />
          <AppTextInput
            label="Account Number"
            value={form.bankAccountNumber}
            onChangeText={(v) => updateField('bankAccountNumber', v)}
            leftIcon="credit-card-outline"
            keyboardType="numeric"
            placeholder="Account number"
          />
          <AppTextInput
            label="IFSC Code"
            value={form.bankIfsc}
            onChangeText={(v) => updateField('bankIfsc', v.toUpperCase())}
            leftIcon="code-brackets"
            placeholder="SBIN0001234"
            maxLength={11}
            autoCapitalize="characters"
          />
          <AppTextInput
            label="UPI ID"
            value={form.upiId}
            onChangeText={(v) => updateField('upiId', v)}
            leftIcon="qrcode-scan"
            placeholder="yourname@upi"
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
          Save Profile
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 8,
  },
});
