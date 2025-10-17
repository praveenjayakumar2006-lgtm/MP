
'use client';

import { ReservationsProvider } from "@/context/reservations-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ReservationsProvider>{children}</ReservationsProvider>;
}
