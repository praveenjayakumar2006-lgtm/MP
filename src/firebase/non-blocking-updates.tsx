
'use client';
import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
  type SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Non-blocking wrapper for addDoc.
 * Emits a FirestorePermissionError on failure.
 */
export function addDocumentNonBlocking<T extends DocumentData>(
  colRef: CollectionReference<T>,
  data: T
): void {
  addDoc(colRef, data).catch((serverError) => {
    const error = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', error);
  });
}

/**
 * Non-blocking wrapper for setDoc.
 * Emits a FirestorePermissionError on failure.
 */
export function setDocumentNonBlocking<T extends DocumentData>(
  docRef: DocumentReference<T>,
  data: T,
  options?: SetOptions
): void {
  setDoc(docRef, data, options || {}).catch((serverError) => {
    const error = new FirestorePermissionError({
      path: docRef.path,
      operation: options && 'merge' in options ? 'update' : 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', error);
  });
}

/**
 * Non-blocking wrapper for updateDoc.
 * Emits a FirestorePermissionError on failure.
 */
export function updateDocumentNonBlocking<T extends DocumentData>(
  docRef: DocumentReference<T>,
  data: Partial<T>
): void {
  updateDoc(docRef, data).catch((serverError) => {
    const error = new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', error);
  });
}

/**
 * Non-blocking wrapper for deleteDoc.
 * Emits a FirestorePermissionError on failure.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference): void {
  deleteDoc(docRef).catch((serverError) => {
    const error = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', error);
  });
}
