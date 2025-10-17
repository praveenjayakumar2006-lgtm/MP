
import { ViolationChecker } from '@/components/violations/violation-checker';

export default function ViolationsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-4">
       <div className="w-full">
        <ViolationChecker />
      </div>
    </div>
  );
}
