
'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

function formatFirestoreError(context: SecurityRuleContext): string {
  const details = {
    auth: 'Unauthenticated (auth is null)',
    method: context.operation.toUpperCase(),
    path: `/databases/(default)/documents/${context.path}`,
    ...(context.requestResourceData && { resource: { data: context.requestResourceData } }),
  };

  return `FirebaseError: Missing or insufficient permissions. The request was denied by Firestore Security Rules:\n${JSON.stringify(details, null, 2)}`;
}

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    super(formatFirestoreError(context));
    this.name = 'FirestorePermissionError';
    this.context = context;
    // This is to make the error object serializable for Next.js
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
