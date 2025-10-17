
'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentData,
  type FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface UseDocOptions<T> {
  map?: (data: DocumentData) => T;
}

interface UseDocReturn<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useDoc<T = DocumentData>(
  memoizedDocRef: DocumentReference | null,
  options?: UseDocOptions<T>
): UseDocReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!memoizedDocRef || !firestore) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const docData = { ...snapshot.data(), id: snapshot.id };
            const mappedData = options?.map ? options.map(docData) : (docData as T);
            setData(mappedData);
          } else {
            setData(null);
          }
          setError(null);
        } catch (e) {
            if (e instanceof Error) {
                console.error("Error mapping document data:", e.message);
                setError({ code: 'internal', message: e.message, name: 'MappingError' });
            }
        } finally {
            setLoading(false);
        }
      },
      (err: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        errorEmitter.emit('permission-error', contextualError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef, firestore, options]);

  return { data, loading, error };
}
