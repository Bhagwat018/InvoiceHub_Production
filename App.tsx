import React, {useEffect, useState, useCallback} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NavigationContainer} from '@react-navigation/native';
import {useMMKVString} from 'react-native-mmkv';
import {storage} from './src/storage';
import {RootNavigator} from './src/navigation';
import LoadingState from './src/components/common/LoadingState';
import {initializeDatabase} from './src/database';
import {useAppStore} from './src/storage/stores/appStore';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E88E5',
    secondary: '#00897B',
    tertiary: '#FFB300',
    error: '#E53935',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    outline: '#E0E0E0',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#4DB6AC',
    tertiary: '#FFD54F',
    error: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    outline: '#3A3A3A',
  },
};

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);

  const setupApp = useCallback(async () => {
    try {
      await initializeDatabase();
      const savedTheme = storage.theme.get();
      if (savedTheme) {
        setThemeMode(savedTheme as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsReady(true);
    }
  }, [setThemeMode]);

  useEffect(() => {
    setupApp();
  }, [setupApp]);

  if (!isReady) {
    return <LoadingState message="Setting up InvoiceHub..." />;
  }

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <NavigationContainer theme={theme}>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#121212' : '#FAFAFA'}
              />
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
