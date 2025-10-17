
import { ViolationChecker } from '@/components/violations/violation-checker';

export default function ViolationsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-4 flex-1 items-center justify-center">
       <div className="text-center">
        <h1 className="text-3xl font-semibold">AI Violation Detector</h1>
        <p className="text-muted-foreground">Submit a report for AI-powered violation detection.</p>
       </div>
       <div className="mt-4 w-full">
        <ViolationChecker />
      </div>
    </div>
  );
}

