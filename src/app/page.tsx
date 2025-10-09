
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ParkingMap } from '@/components/dashboard/parking-map';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <Header title="Dashboard" />
      <main className="px-4 md:px-6">
        <StatsCards />
        <div className="mt-8">
          <ParkingMap />
        </div>
      </main>
    </div>
  );
}
