
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
  userName: string;
  email: string;
  slotId: string;
  vehiclePlate: string;
  startTime: string; // Changed to string
  endTime: string;   // Changed to string
  status: 'Active' | 'Completed' | 'Upcoming';
  createdAt: string; // Changed to string
  updatedAt?: string; // Changed to string, optional
};

export type ViolationType = 'overstaying' | 'unauthorized_parking';

export type Violation = {
  slotNumber: string;
  violationType: ViolationType;
  timestamp: string;
  details: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  phone: string;
};
