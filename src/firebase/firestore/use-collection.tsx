
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
  type Query,
  type DocumentData,
  type FirestoreError,
} from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface UseCollectionOptions<T> {
  map?: (data: DocumentData) => T;
}

interface UseCollectionReturn<T> {
  data: T[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useCollection<T = DocumentData>(
  memoizedQuery: Query | null,
  options?: UseCollectionOptions<T>
): UseCollectionReturn<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!memoizedQuery || !firestore) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        try {
          const mappedData = snapshot.docs.map((doc) => {
            const docData = { ...doc.data(), id: doc.id };
            return options?.map ? options.map(docData) : (docData as T);
          });
          setData(mappedData);
          setError(null);
        } catch (e) {
            if (e instanceof Error) {
                 console.error("Error mapping collection data:", e.message);
                 setError({ code: 'internal', message: e.message, name: 'MappingError' });
            }
        } finally {
            setLoading(false);
        }
      },
      (err: FirestoreError) => {
        const path = (memoizedQuery as any)._query.path.canonicalString();

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        errorEmitter.emit('permission-error', contextualError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery, firestore, options]);

  return { data, loading, error };
}
