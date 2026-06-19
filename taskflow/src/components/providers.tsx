'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { auth, seedDatabaseIfEmpty } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    // 1. Trigger database seeding (runs once if DB is empty)
    seedDatabaseIfEmpty();

    // 2. Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Admin User',
          avatar: firebaseUser.photoURL || undefined
        };
        const defaultWorkspace = {
          id: 'workspace-1',
          name: 'Acme Space Corporation',
          slug: 'acme-space-corp',
          plan: 'PRO' as any
        };
        setAuth(mappedUser, 'firebase-session-token', defaultWorkspace);
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuth, logout, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
