
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { reservations } from '@/lib/data';
import { format } from 'date-fns';

export function ReservationsTable() {
  const getStatusVariant = (status: 'Active' | 'Completed' | 'Upcoming') => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Completed':
        return 'secondary';
      case 'Upcoming':
        return 'outline';
      default:
        return 'default';
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slot ID</TableHead>
              <TableHead>Vehicle Plate</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">{reservation.slotId}</TableCell>
                <TableCell>{reservation.vehiclePlate}</TableCell>
                <TableCell>
                  {format(reservation.startTime, 'MMM d, yyyy, h:mm a')}
                </TableCell>
                <TableCell>
                  {format(reservation.endTime, 'MMM d, yyyy, h:mm a')}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(reservation.status)}>
                    {reservation.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
