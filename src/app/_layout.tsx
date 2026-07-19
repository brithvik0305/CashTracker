import { Ionicons } from '@expo/vector-icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, type ColorValue } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { queryClient } from '@/lib/query-client';
import { DatabaseProvider } from '@/providers/database-provider';

SplashScreen.preventAutoHideAsync();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <DatabaseProvider>
              <Tabs
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: colors.brand,
                  tabBarInactiveTintColor: colors.textTertiary,
                  tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                  },
                }}>
                <Tabs.Screen
                  name="index"
                  options={{ title: 'Home', tabBarIcon: tabIcon('home-outline') }}
                />
                <Tabs.Screen
                  name="accounts"
                  options={{ title: 'Accounts', tabBarIcon: tabIcon('wallet-outline') }}
                />
                <Tabs.Screen
                  name="add"
                  options={{ title: 'Add', tabBarIcon: tabIcon('add-circle') }}
                />
                <Tabs.Screen
                  name="statements"
                  options={{ title: 'Statements', tabBarIcon: tabIcon('bar-chart-outline') }}
                />
                <Tabs.Screen
                  name="more"
                  options={{ title: 'More', tabBarIcon: tabIcon('ellipsis-horizontal') }}
                />
              </Tabs>
            </DatabaseProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
