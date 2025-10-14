
import { ViolationChecker } from '@/components/violations/violation-checker';

export default function ViolationsPage() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-2">
       <h1 className="text-3xl font-semibold text-center">AI Violation Detector</h1>
       <p className="text-muted-foreground text-center">Submit potential parking violations for AI analysis.</p>
       <div className="mt-4 w-full">
        <ViolationChecker />
      </div>
    </div>
  );
}
