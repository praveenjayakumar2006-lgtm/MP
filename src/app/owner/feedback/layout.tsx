
import React from 'react';

export default function OwnerFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <div className="flex flex-1 flex-col bg-background p-4 md:p-6">
        {children}
    </div>
  );
}
