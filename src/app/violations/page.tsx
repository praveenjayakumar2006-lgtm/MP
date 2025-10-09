
import { Header } from '@/components/layout/header';
import { ViolationChecker } from '@/components/violations/violation-checker';

export default function ViolationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <Header title="Violation Detector" />
      <main className="px-4 md:px-6">
        <ViolationChecker />
      </main>
    </div>
  );
}
