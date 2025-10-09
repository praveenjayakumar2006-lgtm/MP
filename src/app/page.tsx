
import { ParkingMap } from '@/components/dashboard/parking-map';

export default function ViewParkingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Parking Availability</h1>
      </div>
      <div className="mx-auto w-full max-w-6xl">
        <ParkingMap />
      </div>
    </div>
  );
}
