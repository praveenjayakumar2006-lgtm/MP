
import { ViolationChecker } from '@/components/violations/violation-checker';

export default function ViolationsPage() {
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
       <div className="text-center">
        <h1 className="text-3xl font-semibold">AI Violation Detector</h1>
        <p className="text-muted-foreground">Select an analysis method and submit for AI-powered violation detection.</p>
       </div>
       <div className="mt-4 w-full">
        <ViolationChecker />
      </div>
    </div>
  );
}
