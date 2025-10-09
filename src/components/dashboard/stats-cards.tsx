
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, ShieldAlert, Grip, CheckCircle2 } from 'lucide-react';
import { parkingSlots } from '@/lib/data';

export function StatsCards() {
  const [stats, setStats] = useState({
    available: 0,
    occupied: 0,
    total: 0,
    violations: 0,
  });

  useEffect(() => {
    const available = parkingSlots.filter((s) => s.status === 'available').length;
    const occupied = parkingSlots.filter((s) => s.status !== 'available').length;
    const total = parkingSlots.length;
    // Simulate violation count
    const violations = Math.floor(Math.random() * 5);

    setStats({ available, occupied, total, violations });
  }, []);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.available}</div>
          <p className="text-xs text-muted-foreground">Ready for parking</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupied Slots</CardTitle>
          <Car className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.occupied}</div>
          <p className="text-xs text-muted-foreground">Currently in use</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
          <Grip className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total capacity</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Violations Today</CardTitle>
          <ShieldAlert className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.violations}</div>
          <p className="text-xs text-muted-foreground">Incidents reported</p>
        </CardContent>
      </Card>
    </div>
  );
}
