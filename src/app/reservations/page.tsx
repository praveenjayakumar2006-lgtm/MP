
import { ReservationsTable } from '@/components/reservations/reservations-table';

export default function ViewBookingsPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
       <h1 className="text-3xl font-semibold">My Bookings</h1>
       <div className="mt-4">
        <ReservationsTable />
      </div>
    </div>
  );
}
