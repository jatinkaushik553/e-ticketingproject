export interface Schedule {
  id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  totalSeats: number;
  vehicleType: 'bus' | 'train';
}

export interface Seat {
  id: string;
  scheduleId: string;
  seatNumber: string;
  status: 'available' | 'booked';
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  scheduleId: string;
  seats: string[];
  amount: number;
  status: 'confirmed' | 'cancelled';
  bookedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}
