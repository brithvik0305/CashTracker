import { Ionicons } from '@expo/vector-icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabs } from '@/components/swipe-tabs';
import { Colors } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';
import { queryClient } from '@/lib/query-client';
import { DatabaseProvider } from '@/providers/database-provider';
import { DbDevTools } from '@/providers/db-devtools';

SplashScreen.preventAutoHideAsync();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return ({ color }: { color: string }) => <Ionicons name={name} color={color} size={22} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <DatabaseProvider>
            {__DEV__ && <DbDevTools />}
            <ThemedNavigation />
          </DatabaseProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Rendered inside DatabaseProvider so the saved theme preference is already
 * loaded before the navigator picks its colours.
 */
function ThemedNavigation() {
  const isDark = useResolvedScheme() === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <SwipeTabs
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          tabBarShowIcon: true,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarPressColor: colors.backgroundSelected,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
            elevation: 0,
            shadowOpacity: 0,
          },
          // A short accent above the active tab, instead of the default
          // full-width underline beneath the labels.
          tabBarIndicatorStyle: {
            backgroundColor: colors.brand,
            height: 2,
            top: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'none',
            marginTop: 2,
          },
          tabBarItemStyle: { paddingVertical: 6 },
        }}>
        <SwipeTabs.Screen
          name="index"
          options={{ title: 'Home', tabBarIcon: tabIcon('home-outline') }}
        />
        <SwipeTabs.Screen
          name="accounts"
          options={{ title: 'Accounts', tabBarIcon: tabIcon('wallet-outline') }}
        />
        <SwipeTabs.Screen
          name="add"
          options={{ title: 'Add', tabBarIcon: tabIcon('add-circle') }}
        />
        <SwipeTabs.Screen
          name="statements"
          options={{ title: 'Statements', tabBarIcon: tabIcon('bar-chart-outline') }}
        />
        <SwipeTabs.Screen
          name="more"
          options={{ title: 'More', tabBarIcon: tabIcon('ellipsis-horizontal') }}
        />
      </SwipeTabs>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
