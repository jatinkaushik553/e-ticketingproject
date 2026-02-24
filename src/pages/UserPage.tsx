import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, MapPin, Calendar, Clock, Ticket, Train, Bus, User, LogOut, X, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Schedule } from '@/lib/types';

const UserPage = () => {
  const { currentUser, schedules, seats, bookings, bookTicket, cancelBooking, logout } = useStore();
  const navigate = useNavigate();

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [searchResults, setSearchResults] = useState<Schedule[] | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingName, setBookingName] = useState(currentUser?.name || '');
  const [bookingEmail, setBookingEmail] = useState(currentUser?.email || '');
  const [bookingPhone, setBookingPhone] = useState(currentUser?.phone || '');
  const [activeTab, setActiveTab] = useState<'search' | 'bookings'>('search');
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [bookFormOpen, setBookFormOpen] = useState(false);

  if (!currentUser || currentUser.role !== 'user') {
    navigate('/');
    return null;
  }

  const handleSearch = () => {
    const results = schedules.filter(s => {
      const matchSource = !source || s.source.toLowerCase().includes(source.toLowerCase());
      const matchDest = !destination || s.destination.toLowerCase().includes(destination.toLowerCase());
      const matchDate = !date || s.date === date;
      return matchSource && matchDest && matchDate;
    });
    setSearchResults(results);
  };

  const scheduleSeats = (scheduleId: string) => seats.filter(s => s.scheduleId === scheduleId);

  const handleSelectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setSeatDialogOpen(true);
  };

  const toggleSeat = (seatNumber: string) => {
    setSelectedSeats(prev =>
      prev.includes(seatNumber) ? prev.filter(s => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const handleBook = () => {
    if (!selectedSchedule || selectedSeats.length === 0) {
      toast.error('Select at least one seat');
      return;
    }
    if (!bookingName || !bookingEmail || !bookingPhone) {
      toast.error('Fill in all passenger details');
      return;
    }
    const booking = bookTicket(selectedSchedule.id, selectedSeats, bookingName, bookingEmail, bookingPhone);
    if (booking) {
      toast.success(`Booking confirmed! ID: ${booking.id}`);
      setSeatDialogOpen(false);
      setBookFormOpen(false);
      setSelectedSchedule(null);
      setSelectedSeats([]);
      setActiveTab('bookings');
    }
  };

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    toast.success('Booking cancelled & refund initiated');
  };

  const userBookings = bookings.filter(b => b.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            <span className="text-xl font-heading font-bold">E-Ticket</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{currentUser.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary-foreground/80" onClick={() => { logout(); navigate('/'); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === 'search' ? 'default' : 'outline'} onClick={() => setActiveTab('search')}>
            <Search className="h-4 w-4 mr-2" /> Search & Book
          </Button>
          <Button variant={activeTab === 'bookings' ? 'default' : 'outline'} onClick={() => setActiveTab('bookings')}>
            <Ticket className="h-4 w-4 mr-2" /> My Bookings ({userBookings.length})
          </Button>
        </div>

        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2"><Search className="h-5 w-5" /> Search Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> From</Label>
                    <Input placeholder="e.g. Delhi" value={source} onChange={e => setSource(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> To</Label>
                    <Input placeholder="e.g. Mumbai" value={destination} onChange={e => setDestination(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" onClick={handleSearch}>
                      <Search className="h-4 w-4 mr-2" /> Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {searchResults !== null && (
              <div className="space-y-3">
                <h2 className="font-heading font-semibold text-lg">{searchResults.length} schedule(s) found</h2>
                {searchResults.length === 0 && <p className="text-muted-foreground">No schedules match your search. Try different criteria.</p>}
                {searchResults.map(schedule => {
                  const available = scheduleSeats(schedule.id).filter(s => s.status === 'available').length;
                  return (
                    <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {schedule.vehicleType === 'train' ? <Train className="h-8 w-8 text-primary" /> : <Bus className="h-8 w-8 text-primary" />}
                            <div>
                              <div className="font-heading font-semibold text-lg">
                                {schedule.source} → {schedule.destination}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{schedule.date}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{schedule.time}</span>
                                <Badge variant="outline" className="capitalize">{schedule.vehicleType}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-heading text-2xl font-bold text-primary">₹{schedule.price}</div>
                              <div className="text-xs text-muted-foreground">{available} seats left</div>
                            </div>
                            <Button onClick={() => handleSelectSchedule(schedule)} disabled={available === 0}>
                              {available > 0 ? 'Select Seats' : 'Full'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-heading font-semibold text-lg">My Bookings</h2>
            {userBookings.length === 0 && <p className="text-muted-foreground">No bookings yet. Search and book a ticket!</p>}
            {userBookings.map(booking => {
              const schedule = schedules.find(s => s.id === booking.scheduleId);
              return (
                <Card key={booking.id} className={booking.status === 'cancelled' ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading font-semibold">
                            {schedule ? `${schedule.source} → ${schedule.destination}` : 'Unknown Route'}
                          </span>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          <div>Booking ID: {booking.id}</div>
                          <div>Seats: {booking.seats.join(', ')}</div>
                          <div>Amount: ₹{booking.amount}</div>
                          {schedule && <div>{schedule.date} at {schedule.time}</div>}
                          <div>Booked: {new Date(booking.bookedAt).toLocaleString()}</div>
                        </div>
                      </div>
                      {booking.status === 'confirmed' && (
                        <Button variant="destructive" size="sm" onClick={() => handleCancel(booking.id)}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Seat Selection Dialog */}
      <Dialog open={seatDialogOpen} onOpenChange={setSeatDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selectedSchedule && `${selectedSchedule.source} → ${selectedSchedule.destination}`}
            </DialogTitle>
          </DialogHeader>
          {selectedSchedule && !bookFormOpen && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select your seats (click to toggle)</p>
              <div className="grid grid-cols-4 gap-2">
                {scheduleSeats(selectedSchedule.id).map(seat => (
                  <button
                    key={seat.id}
                    disabled={seat.status === 'booked'}
                    onClick={() => toggleSeat(seat.seatNumber)}
                    className={`p-2 rounded-md text-xs font-medium border transition-all ${
                      seat.status === 'booked'
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : selectedSeats.includes(seat.seatNumber)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-card-foreground border-border hover:border-primary'
                    }`}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-card border" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> Selected</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted" /> Booked</span>
              </div>
              {selectedSeats.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm">{selectedSeats.length} seat(s) × ₹{selectedSchedule.price}</span>
                    <span className="font-heading font-bold text-lg text-primary">₹{selectedSeats.length * selectedSchedule.price}</span>
                  </div>
                  <Button className="w-full" onClick={() => setBookFormOpen(true)}>Continue to Book</Button>
                </div>
              )}
            </div>
          )}
          {selectedSchedule && bookFormOpen && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Passenger Details</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input value={bookingName} onChange={e => setBookingName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={bookingEmail} onChange={e => setBookingEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={bookingPhone} onChange={e => setBookingPhone(e.target.value)} />
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Seats: {selectedSeats.join(', ')}</span>
                  <span className="font-heading font-bold text-primary">₹{selectedSeats.length * selectedSchedule.price}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setBookFormOpen(false)}>Back</Button>
                  <Button className="flex-1" onClick={handleBook}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPage;
