import { Redirect, type Href } from 'expo-router';

import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const onboardingComplete = useAppStore((state) => state.settings.onboardingComplete);
  return <Redirect href={(onboardingComplete ? '/(tabs)' : '/onboarding') as Href} />;
}
