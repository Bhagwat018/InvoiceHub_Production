import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCustomers } from '../../hooks/useCustomers';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import AppTextInput from '../../components/inputs/AppTextInput';
import PhoneInput from '../../components/inputs/PhoneInput';
import AppSelect from '../../components/inputs/AppSelect';
import LoadingState from '../../components/common/LoadingState';
import {
  INDIAN_STATES,
  GST_NUMBER_REGEX,
  PAN_NUMBER_REGEX,
  PHONE_REGEX,
  EMAIL_REGEX,
  PINCODE_REGEX,
} from '../../constants';
import type { CustomerStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'CustomerForm'>;

interface FormData {
  name: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  panNumber?: string;
  pincode?: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  phone: '',
  email: '',
  gstNumber: '',
  panNumber: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  notes: '',
};

const STATE_OPTIONS = INDIAN_STATES.map((s) => ({ label: s, value: s }));

export default function CustomerFormScreen() {
  const theme = useTheme();
  const { colors } = useAppTheme();
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { customerId } = (route.params as { customerId?: string }) || {};

  const { getCustomer, createCustomer, updateCustomer } = useCustomers();
  const isEditing = !!customerId;

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && customerId) {
      getCustomer(customerId)
        .then((customer) => {
          setForm({
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            gstNumber: customer.gstNumber || '',
            panNumber: customer.panNumber || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            pincode: customer.pincode || '',
            notes: customer.notes || '',
          });
        })
        .catch(() => {
          Alert.alert('Error', 'Failed to load customer data');
          navigation.goBack();
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditing, customerId, getCustomer, navigation]);

  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (form.phone && !PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (form.email && !EMAIL_REGEX.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (form.gstNumber && !GST_NUMBER_REGEX.test(form.gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Enter a valid GST number (e.g., 22AAAAA0000A1Z5)';
    }

    if (form.panNumber && !PAN_NUMBER_REGEX.test(form.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Enter a valid PAN number (e.g., ABCDE1234F)';
    }

    if (form.pincode && !PINCODE_REGEX.test(form.pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        gstNumber: form.gstNumber.trim().toUpperCase() || null,
        panNumber: form.panNumber.trim().toUpperCase() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state || null,
        pincode: form.pincode.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (isEditing && customerId) {
        await updateCustomer(customerId, data);
      } else {
        await createCustomer(data);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        isEditing ? 'Failed to update customer' : 'Failed to create customer'
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    isEditing,
    customerId,
    validate,
    createCustomer,
    updateCustomer,
    navigation,
  ]);

  const handleImportFromContacts = () => {
    Alert.alert(
      'Import from Contacts',
      'This feature will open your contacts to import customer details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Contacts', onPress: () => {} },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingState message="Loading customer..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={isEditing ? 'Edit Customer' : 'Add Customer'}
        actions={
          !isEditing
            ? [
                {
                  icon: 'contacts',
                  onPress: handleImportFromContacts,
                },
              ]
            : undefined
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.sectionHeader}>
            <Icon name="account-outline" size={20} color={theme.colors.primary} />
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Basic Information
            </AppText>
          </View>

          <AppTextInput
            label="Customer Name *"
            placeholder="Enter customer name"
            value={form.name}
            onChangeText={(value) => updateField('name', value)}
            error={errors.name}
            leftIcon="account-outline"
            autoCapitalize="words"
          />

          <PhoneInput
            label="Phone Number"
            value={form.phone}
            onChangeValue={(value) => updateField('phone', value)}
            error={errors.phone}
          />

          <AppTextInput
            label="Email Address"
            placeholder="customer@example.com"
            value={form.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
            leftIcon="email-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Surface>

        <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.sectionHeader}>
            <Icon name="shield-check-outline" size={20} color={theme.colors.primary} />
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Tax Information
            </AppText>
          </View>

          <AppTextInput
            label="GST Number"
            placeholder="22AAAAA0000A1Z5"
            value={form.gstNumber}
            onChangeText={(value) => updateField('gstNumber', value.toUpperCase())}
            error={errors.gstNumber}
            leftIcon="alpha-g-circle-outline"
            autoCapitalize="characters"
            maxLength={15}
          />

          <AppTextInput
            label="PAN Number"
            placeholder="ABCDE1234F"
            value={form.panNumber}
            onChangeText={(value) => updateField('panNumber', value.toUpperCase())}
            error={errors.panNumber}
            leftIcon="alpha-p-circle-outline"
            autoCapitalize="characters"
            maxLength={10}
          />
        </Surface>

        <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker-outline" size={20} color={theme.colors.primary} />
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Address
            </AppText>
          </View>

          <AppTextInput
            label="Address"
            placeholder="Enter full address"
            value={form.address}
            onChangeText={(value) => updateField('address', value)}
            leftIcon="home-outline"
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <AppTextInput
                label="City"
                placeholder="City"
                value={form.city}
                onChangeText={(value) => updateField('city', value)}
                leftIcon="city-variant-outline"
              />
            </View>
            <View style={styles.halfField}>
              <AppTextInput
                label="Pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChangeText={(value) => updateField('pincode', value)}
                error={errors.pincode}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          <AppSelect
            label="State"
            value={form.state}
            options={STATE_OPTIONS}
            placeholder="Select State"
            onSelect={(value) => updateField('state', value)}
          />
        </Surface>

        <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.sectionHeader}>
            <Icon name="note-text-outline" size={20} color={theme.colors.primary} />
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Additional Notes
            </AppText>
          </View>

          <AppTextInput
            label="Notes"
            placeholder="Any additional notes about this customer"
            value={form.notes}
            onChangeText={(value) => updateField('notes', value)}
            leftIcon="note-outline"
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
        </Surface>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={isSaving}
            disabled={isSaving}
            icon={isEditing ? 'check' : 'plus'}
          >
            {isEditing ? 'Update Customer' : 'Add Customer'}
          </Button>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
