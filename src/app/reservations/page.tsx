
import { ReservationsTable } from '@/components/reservations/reservations-table';

export default function ViewBookingsPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
       <div>
        <h1 className="text-3xl font-semibold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your past, active, and upcoming reservations.</p>
       </div>
       <div>
        <ReservationsTable />
      </div>
    </div>
  );
}
