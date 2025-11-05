
import React from 'react';

export default function OwnerFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <div className="flex flex-1 flex-col bg-background p-4 md:p-6">
      <div className="container mx-auto px-4 md:px-6 flex-1">
        {children}
      </div>
    </div>
  );
}
