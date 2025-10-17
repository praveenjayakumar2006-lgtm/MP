
'use client';
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  useCallback,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore, DocumentReference, Query } from 'firebase/firestore';

// Define the context shape
interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  useMemoFirebase: <T>(factory: () => T, deps: React.DependencyList) => T;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

// Custom hook to use the Firebase context
export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  return useFirebase().firebaseApp;
};

export const useAuth = (): Auth | null => {
  return useFirebase().auth;
};

export const useFirestore = (): Firestore | null => {
  return useFirebase().firestore;
};

// Memoization hook for Firebase references
export const useMemoFirebase = <T extends DocumentReference | Query | null>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
};

// Define the provider props
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Create the provider component
export const FirebaseProvider = ({
  children,
  firebaseApp,
  auth,
  firestore,
}: FirebaseProviderProps) => {
  const memoizedUseMemoFirebase = useCallback(
    <T,>(factory: () => T, deps: React.DependencyList): T => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useMemo(factory, deps);
    },
    []
  );

  const value = useMemo(
    () => ({
      firebaseApp,
      auth,
      firestore,
      useMemoFirebase: memoizedUseMemoFirebase,
    }),
    [firebaseApp, auth, firestore, memoizedUseMemoFirebase]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
