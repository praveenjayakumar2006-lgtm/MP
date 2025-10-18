
import React from 'react';

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <div className="flex flex-1 flex-col bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6 flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
