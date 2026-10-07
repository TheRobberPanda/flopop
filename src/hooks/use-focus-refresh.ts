import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAppStore } from '@/store/useAppStore';

/**
 * Forces a re-render (and a database re-read) whenever the screen regains focus.
 * Screens can sit idle behind a modal or another tab, so relying on the store
 * subscription alone can leave stale data on screen.
 */
export function useFocusRefresh(): number {
  const [tick, setTick] = useState(0);
  const bumpRevision = useAppStore((state) => state.bumpRevision);

  useFocusEffect(
    useCallback(() => {
      setTick((value) => value + 1);
      bumpRevision();
    }, [bumpRevision]),
  );

  return tick;
}
