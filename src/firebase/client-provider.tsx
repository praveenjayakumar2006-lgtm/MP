'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type FirebaseInstances = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // Initialize Firebase only on the client
    const { firebaseApp, auth, firestore } = initializeFirebase();
    setInstances({ firebaseApp, auth, firestore });
  }, []);

  if (!instances) {
    // You can return a loader here if you want
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={instances.firebaseApp}
      auth={instances.auth}
      firestore={instances.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
