import { useState, useEffect, useCallback } from 'react';

interface WakeLockHook {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export const useWakeLock = (): WakeLockHook => {
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const request = useCallback(async () => {
    if (!isSupported) return;
    
    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setWakeLock(lock);
      setIsActive(true);
      
      lock.addEventListener('release', () => {
        setIsActive(false);
        setWakeLock(null);
      });
    } catch (error) {
      console.error('Wake lock request failed:', error);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsActive(false);
      } catch (error) {
        console.error('Wake lock release failed:', error);
      }
    }
  }, [wakeLock]);

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [wakeLock]);

  return {
    isSupported,
    isActive,
    request,
    release,
  };
};
