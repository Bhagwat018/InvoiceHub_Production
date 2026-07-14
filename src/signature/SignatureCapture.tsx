import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SignaturePad from './SignaturePad';
import AppText from '../../components/common/AppText';

export default function SignatureCaptureScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const signatureRef = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = useCallback(async () => {
    if (!hasSignature) {
      Alert.alert('No Signature', 'Please draw your signature first.');
      return;
    }

    setIsSaving(true);
    try {
      const base64 = await signatureRef.current?.toBase64();
      const callback = route.params?.onSave;
      if (callback) {
        callback(base64);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save signature.');
    } finally {
      setIsSaving(false);
    }
  }, [hasSignature, route.params, navigation]);

  const onClear = useCallback(() => {
    signatureRef.current?.clear();
    setHasSignature(false);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <AppText variant="h4" color="textPrimary">
          Signature
        </AppText>
        <AppText variant="bodySmall" color="textTertiary" style={{ marginTop: 4 }}>
          Draw your signature below
        </AppText>
      </View>

      <Surface style={[styles.canvasContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <SignaturePad
          ref={signatureRef}
          onChange={() => setHasSignature(true)}
          style={styles.signaturePad}
          penColor={theme.colors.textPrimary}
          backgroundColor={theme.colors.surface}
        />
      </Surface>

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={onClear}
          style={[styles.button, { borderColor: theme.colors.border }]}
          labelStyle={{ color: theme.colors.textPrimary }}
          icon="delete-outline"
        >
          Clear
        </Button>
        <Button
          mode="contained"
          onPress={onSave}
          loading={isSaving}
          disabled={!hasSignature || isSaving}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ color: theme.colors.onPrimary, fontWeight: '600' }}
          icon="check"
        >
          Save Signature
        </Button>
      </View>

      <AppText variant="caption" color="textTertiary" align="center" style={styles.hint}>
        This signature will appear on your invoices
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  canvasContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  signaturePad: {
    flex: 1,
    minHeight: 200,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  hint: {
    marginBottom: 8,
  },
});
