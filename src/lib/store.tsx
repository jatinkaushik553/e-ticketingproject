import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Schedule, Seat, Booking, User } from './types';

const INITIAL_SCHEDULES: Schedule[] = [
  { id: 's1', source: 'Delhi', destination: 'Mumbai', date: '2026-03-01', time: '08:00', price: 1200, totalSeats: 40, vehicleType: 'train' },
  { id: 's2', source: 'Delhi', destination: 'Jaipur', date: '2026-03-01', time: '10:00', price: 600, totalSeats: 36, vehicleType: 'bus' },
  { id: 's3', source: 'Mumbai', destination: 'Pune', date: '2026-03-02', time: '07:30', price: 400, totalSeats: 36, vehicleType: 'bus' },
  { id: 's4', source: 'Bangalore', destination: 'Chennai', date: '2026-03-02', time: '14:00', price: 800, totalSeats: 40, vehicleType: 'train' },
  { id: 's5', source: 'Kolkata', destination: 'Patna', date: '2026-03-03', time: '06:00', price: 550, totalSeats: 36, vehicleType: 'train' },
  { id: 's6', source: 'Hyderabad', destination: 'Vizag', date: '2026-03-03', time: '16:00', price: 700, totalSeats: 40, vehicleType: 'bus' },
];

function generateSeats(scheduleId: string, total: number): Seat[] {
  return Array.from({ length: total }, (_, i) => ({
    id: `${scheduleId}-seat-${i + 1}`,
    scheduleId,
    seatNumber: `${Math.floor(i / 4) + 1}${['A', 'B', 'C', 'D'][i % 4]}`,
    status: 'available' as const,
  }));
}

interface StoreState {
  currentUser: User | null;
  schedules: Schedule[];
  seats: Seat[];
  bookings: Booking[];
  login: (email: string, password: string, role: 'user' | 'admin') => boolean;
  register: (name: string, email: string, phone: string, password: string) => boolean;
  logout: () => void;
  addSchedule: (s: Omit<Schedule, 'id'>) => void;
  updateSchedule: (s: Schedule) => void;
  deleteSchedule: (id: string) => void;
  updateSeatPrice: (scheduleId: string, price: number) => void;
  bookTicket: (scheduleId: string, seatNumbers: string[], userName: string, userEmail: string, userPhone: string) => Booking | null;
  cancelBooking: (bookingId: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('eticket_user', null));
  const [schedules, setSchedules] = useState<Schedule[]>(() => loadFromStorage('eticket_schedules', INITIAL_SCHEDULES));
  const [seats, setSeats] = useState<Seat[]>(() => {
    const stored = loadFromStorage<Seat[]>('eticket_seats', []);
    if (stored.length > 0) return stored;
    return INITIAL_SCHEDULES.flatMap(s => generateSeats(s.id, s.totalSeats));
  });
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage('eticket_bookings', []));
  const [users, setUsers] = useState<Array<User & { password: string }>>(() =>
    loadFromStorage('eticket_users', [
      { id: 'admin1', name: 'Admin', email: 'admin@eticket.com', phone: '9999999999', role: 'admin' as const, password: 'admin123' },
    ])
  );

  useEffect(() => { localStorage.setItem('eticket_user', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('eticket_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('eticket_seats', JSON.stringify(seats)); }, [seats]);
  useEffect(() => { localStorage.setItem('eticket_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('eticket_users', JSON.stringify(users)); }, [users]);

  const login = (email: string, password: string, role: 'user' | 'admin'): boolean => {
    const found = users.find(u => u.email === email && u.password === password && u.role === role);
    if (found) { setCurrentUser({ id: found.id, name: found.name, email: found.email, phone: found.phone, role: found.role }); return true; }
    return false;
  };

  const register = (name: string, email: string, phone: string, password: string): boolean => {
    if (users.find(u => u.email === email)) return false;
    const newUser = { id: `u-${Date.now()}`, name, email, phone, role: 'user' as const, password };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser({ id: newUser.id, name, email, phone, role: 'user' });
    return true;
  };

  const logout = () => setCurrentUser(null);

  const addSchedule = (s: Omit<Schedule, 'id'>) => {
    const id = `s-${Date.now()}`;
    setSchedules(prev => [...prev, { ...s, id }]);
    setSeats(prev => [...prev, ...generateSeats(id, s.totalSeats)]);
  };

  const updateSchedule = (s: Schedule) => {
    setSchedules(prev => prev.map(x => x.id === s.id ? s : x));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(x => x.id !== id));
    setSeats(prev => prev.filter(x => x.scheduleId !== id));
  };

  const updateSeatPrice = (scheduleId: string, price: number) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, price } : s));
  };

  const bookTicket = (scheduleId: string, seatNumbers: string[], userName: string, userEmail: string, userPhone: string): Booking | null => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return null;
    const booking: Booking = {
      id: `b-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      userName,
      userEmail,
      userPhone,
      scheduleId,
      seats: seatNumbers,
      amount: schedule.price * seatNumbers.length,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };
    setBookings(prev => [...prev, booking]);
    setSeats(prev => prev.map(seat =>
      seat.scheduleId === scheduleId && seatNumbers.includes(seat.seatNumber)
        ? { ...seat, status: 'booked' }
        : seat
    ));
    return booking;
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    setSeats(prev => prev.map(seat =>
      seat.scheduleId === booking.scheduleId && booking.seats.includes(seat.seatNumber)
        ? { ...seat, status: 'available' }
        : seat
    ));
  };

  return (
    <StoreContext.Provider value={{
      currentUser, schedules, seats, bookings,
      login, register, logout,
      addSchedule, updateSchedule, deleteSchedule, updateSeatPrice,
      bookTicket, cancelBooking,
    }}>
      {children}
    </StoreContext.Provider>
  );
}
