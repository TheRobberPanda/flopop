import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockScreen } from '@/components/lock-screen';
import { configureNotifications } from '@/lib/notifications';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const ready = useAppStore((state) => state.ready);
  const locked = useAppStore((state) => state.locked);
  const init = useAppStore((state) => state.init);
  const { isDark } = useTheme();

  useEffect(() => {
    configureNotifications();
    void init();
  }, [init]);

  useEffect(() => {
    if (fontsLoaded && ready) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, ready]);

  if (!fontsLoaded || !ready) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', freezeOnBlur: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="log/[date]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="predictions" />
          <Stack.Screen name="reminders" />
          <Stack.Screen name="contraception/index" />
          <Stack.Screen name="pregnancy/index" />
          <Stack.Screen name="report/index" />
          <Stack.Screen name="backup" />
          <Stack.Screen name="articles/index" />
          <Stack.Screen name="articles/[id]" />
        </Stack>
        {locked ? (
          <View style={StyleSheet.absoluteFill}>
            <LockScreen />
          </View>
        ) : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
