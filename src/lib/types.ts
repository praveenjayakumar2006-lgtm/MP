

export type ParkingSlotStatus = 'available' | 'occupied' | 'reserved';
export type VehicleType = 'car' | 'bike';

export type ParkingSlot = {
  id: string;
  type: VehicleType;
  status?: ParkingSlotStatus;
  reservedBy?: 'user' | 'other';
  reservationId?: string;
  forceIcon?: boolean;
};

export type Reservation = {
  id: string;
  userId: string;
  slotId: string;
  vehiclePlate: string;
  startTime: Date;
  endTime: Date;
  status: 'Active' | 'Completed' | 'Upcoming';
  createdAt: Date;
  updatedAt: Date;
};

export type ViolationType = 'overstaying' | 'unauthorized_parking';

export type Violation = {
  slotNumber: string;
  violationType: ViolationType;
  timestamp: string;
  details: string;
};
