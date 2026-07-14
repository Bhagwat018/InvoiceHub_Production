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
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../../components/common/AppText';

export default function BarcodeScannerScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<Camera>(null);

  const device = useCameraDevice('back');

  const onCodeScanned = useCallback(
    (codes: any[]) => {
      if (scanned) return;
      const code = codes[0];
      if (code?.value) {
        setScanned(true);
        const callback = route.params?.onScan;
        if (callback) {
          callback(code.value);
        }
        navigation.goBack();
      }
    },
    [scanned, navigation, route.params],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a', 'upc-e'],
    onCodeScanned,
  });

  if (!device) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Icon name="camera-off-outline" size={64} color={theme.colors.textTertiary} />
        <AppText variant="h5" color="textSecondary" style={{ marginTop: 16 }}>
          Camera not available
        </AppText>
        <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        enableZoomGesture={false}
        torch={flashEnabled ? 'on' : 'off'}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <AppText variant="h5" color="textInverse">
            Scan Barcode
          </AppText>
          <TouchableOpacity
            onPress={() => setFlashEnabled(!flashEnabled)}
            style={styles.flashButton}
          >
            <Icon
              name={flashEnabled ? 'flash' : 'flash-off'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Scan area indicator */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Bottom instructions */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <AppText variant="bodyMedium" color="textInverse" align="center">
            Position the barcode within the frame
          </AppText>
          <AppText variant="caption" color="textTertiary" align="center" style={{ marginTop: 8 }}>
            Supports QR, EAN-13, Code-128, UPC-A
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanAreaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#42A5F5',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  bottomBar: {
    paddingHorizontal: 32,
    paddingTop: 16,
  },
});
