import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useTheme, Text, Card, Switch, Button, Divider, List} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

export default function BackupScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleManualBackup = useCallback(async () => {
    setIsBackingUp(true);
    try {
      // Backup logic will be handled by BackupService
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastBackup(new Date().toLocaleString());
      Alert.alert('Backup Complete', 'Your data has been backed up successfully.');
    } catch (error) {
      Alert.alert('Backup Failed', 'An error occurred while backing up your data.');
    } finally {
      setIsBackingUp(false);
    }
  }, []);

  const handleRestore = useCallback(() => {
    Alert.alert(
      'Restore Backup',
      'This will replace all current data with the backup. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              // Restore logic will be handled by BackupService
              Alert.alert('Restore Complete', 'Your data has been restored successfully.');
            } catch (error) {
              Alert.alert('Restore Failed', 'An error occurred while restoring.');
            }
          },
        },
      ],
    );
  }, []);

  const handleExportData = useCallback(() => {
    Alert.alert('Export Data', 'Choose export format', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'CSV', onPress: () => Alert.alert('Export', 'Exporting as CSV...')},
      {text: 'JSON', onPress: () => Alert.alert('Export', 'Exporting as JSON...')},
    ]);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingTop: 8,
    },
    backButton: {
      marginRight: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    cardContent: {
      paddingVertical: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    rowLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    rowValue: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: lastBackup ? '#E8F5E9' : '#FFF3E0',
    },
    statusText: {
      fontSize: 12,
      color: lastBackup ? '#2E7D32' : '#E65100',
      fontWeight: '500',
    },
    button: {
      marginTop: 8,
      borderRadius: 8,
    },
    divider: {
      marginVertical: 8,
    },
    frequencyContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    frequencyChip: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    frequencyChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    frequencyText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    frequencyTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    exportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.title}>Backup & Restore</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Google Drive Backup */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>Google Drive Backup</Text>
                <Text style={[styles.rowValue, {marginTop: 4}]}>
                  Sync your data to Google Drive
                </Text>
              </View>
              <Icon name="cloud" size={32} color={theme.colors.primary} />
            </View>
          </Card.Content>
        </Card>

        {/* Auto Backup */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Auto Backup</Text>
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                color={theme.colors.primary}
              />
            </View>
            {autoBackup && (
              <View>
                <Text style={[styles.rowLabel, {marginTop: 12}]}>Frequency</Text>
                <View style={styles.frequencyContainer}>
                  {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyChip,
                        backupFrequency === freq && styles.frequencyChipActive,
                      ]}
                      onPress={() => setBackupFrequency(freq)}>
                      <Text
                        style={[
                          styles.frequencyText,
                          backupFrequency === freq && styles.frequencyTextActive,
                        ]}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Last Backup Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Backup Status</Text>
            <Divider style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Last Backup</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {lastBackup || 'Never'}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Backup Size</Text>
              <Text style={styles.rowValue}>{lastBackup ? '2.4 MB' : '—'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Manual Backup */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Actions</Text>
            <Divider style={styles.divider} />
            <Button
              mode="contained"
              icon="cloud-upload"
              onPress={handleManualBackup}
              loading={isBackingUp}
              disabled={isBackingUp}
              style={styles.button}
              buttonColor={theme.colors.primary}>
              {isBackingUp ? 'Backing up...' : 'Backup Now'}
            </Button>
            <Button
              mode="outlined"
              icon="cloud-download"
              onPress={handleRestore}
              style={styles.button}>
              Restore from Backup
            </Button>
          </Card.Content>
        </Card>

        {/* Export Data */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Export Data</Text>
            <Divider style={styles.divider} />
            <List.Item
              title="Export as CSV"
              description="Spreadsheet compatible format"
              left={props => <List.Icon {...props} icon="file-delimited" />}
              onPress={handleExportData}
            />
            <List.Item
              title="Export as JSON"
              description="Complete data backup"
              left={props => <List.Icon {...props} icon="code-json" />}
              onPress={handleExportData}
            />
          </Card.Content>
        </Card>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}
