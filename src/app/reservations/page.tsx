
import { Header } from '@/components/layout/header';
import { ReservationsTable } from '@/components/reservations/reservations-table';

export default function ReservationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <Header title="My Reservations" />
      <main className="px-4 md:px-6">
        <ReservationsTable />
      </main>
    </div>
  );
}
