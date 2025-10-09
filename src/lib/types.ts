
export type ParkingSlotStatus = 'available' | 'occupied' | 'reserved';

export type ParkingSlot = {
  id: string;
  status: ParkingSlotStatus;
};

export type Reservation = {
  id: string;
  slotId: string;
  vehiclePlate: string;
  startTime: Date;
  endTime: Date;
  status: 'Active' | 'Completed' | 'Upcoming';
};

export type ViolationType = 'overstaying' | 'unauthorized_parking';

export type Violation = {
  slotNumber: string;
  violationType: ViolationType;
  timestamp: string;
  details: string;
};
