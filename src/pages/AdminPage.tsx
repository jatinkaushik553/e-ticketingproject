import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, LogOut, Plus, Pencil, Trash2, BarChart3, Ticket, Train, Bus, Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Schedule } from '@/lib/types';

const AdminPage = () => {
  const { currentUser, schedules, seats, bookings, logout, addSchedule, updateSchedule, deleteSchedule, updateSeatPrice } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'schedules' | 'bookings' | 'reports'>('schedules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form state
  const [formSource, setFormSource] = useState('');
  const [formDest, setFormDest] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSeats, setFormSeats] = useState('36');
  const [formType, setFormType] = useState<'bus' | 'train'>('bus');

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/');
    return null;
  }

  const openAdd = () => {
    setEditingSchedule(null);
    setFormSource(''); setFormDest(''); setFormDate(''); setFormTime(''); setFormPrice(''); setFormSeats('36'); setFormType('bus');
    setDialogOpen(true);
  };

  const openEdit = (s: Schedule) => {
    setEditingSchedule(s);
    setFormSource(s.source); setFormDest(s.destination); setFormDate(s.date); setFormTime(s.time);
    setFormPrice(String(s.price)); setFormSeats(String(s.totalSeats)); setFormType(s.vehicleType);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formSource || !formDest || !formDate || !formTime || !formPrice) {
      toast.error('Fill all fields');
      return;
    }
    if (editingSchedule) {
      updateSchedule({ ...editingSchedule, source: formSource, destination: formDest, date: formDate, time: formTime, price: Number(formPrice), vehicleType: formType });
      toast.success('Schedule updated');
    } else {
      addSchedule({ source: formSource, destination: formDest, date: formDate, time: formTime, price: Number(formPrice), totalSeats: Number(formSeats), vehicleType: formType });
      toast.success('Schedule added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSchedule(id);
    toast.success('Schedule deleted');
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-sidebar-primary" />
            <span className="text-xl font-heading font-bold">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" className="text-sidebar-foreground" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Schedules', value: schedules.length, icon: Calendar, color: 'text-primary' },
            { label: 'Total Bookings', value: bookings.length, icon: Ticket, color: 'text-secondary' },
            { label: 'Active Bookings', value: confirmedBookings.length, icon: Users, color: 'text-success' },
            { label: 'Revenue', value: `₹${totalRevenue}`, icon: DollarSign, color: 'text-warning' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-heading font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === 'schedules' ? 'default' : 'outline'} onClick={() => setActiveTab('schedules')}>
            <Calendar className="h-4 w-4 mr-2" /> Schedules
          </Button>
          <Button variant={activeTab === 'bookings' ? 'default' : 'outline'} onClick={() => setActiveTab('bookings')}>
            <Ticket className="h-4 w-4 mr-2" /> All Bookings
          </Button>
          <Button variant={activeTab === 'reports' ? 'default' : 'outline'} onClick={() => setActiveTab('reports')}>
            <BarChart3 className="h-4 w-4 mr-2" /> Reports
          </Button>
        </div>

        {activeTab === 'schedules' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-semibold text-lg">Manage Schedules</h2>
              <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Schedule</Button>
            </div>
            {schedules.map(schedule => {
              const available = seats.filter(s => s.scheduleId === schedule.id && s.status === 'available').length;
              const booked = seats.filter(s => s.scheduleId === schedule.id && s.status === 'booked').length;
              return (
                <Card key={schedule.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {schedule.vehicleType === 'train' ? <Train className="h-6 w-6 text-primary" /> : <Bus className="h-6 w-6 text-primary" />}
                        <div>
                          <div className="font-heading font-semibold">{schedule.source} → {schedule.destination}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{schedule.date}</span>
                            <span>{schedule.time}</span>
                            <Badge variant="outline">₹{schedule.price}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-right">
                          <div className="text-success font-medium">{available} available</div>
                          <div className="text-muted-foreground">{booked} booked</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openEdit(schedule)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(schedule.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-heading font-semibold text-lg">All Bookings ({bookings.length})</h2>
            {bookings.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
            {bookings.map(booking => {
              const schedule = schedules.find(s => s.id === booking.scheduleId);
              return (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading font-semibold">{booking.userName}</span>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'}>{booking.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>{schedule ? `${schedule.source} → ${schedule.destination}` : 'Unknown'} | Seats: {booking.seats.join(', ')}</div>
                          <div>{booking.userEmail} | {booking.userPhone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading font-bold text-primary">₹{booking.amount}</div>
                        <div className="text-xs text-muted-foreground">{new Date(booking.bookedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-heading font-semibold text-lg">Reports Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="font-heading text-base">Booking Overview</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Bookings</span><span className="font-bold">{bookings.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Confirmed</span><span className="font-bold text-success">{confirmedBookings.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cancelled</span><span className="font-bold text-destructive">{cancelledBookings.length}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Total Revenue</span><span className="font-heading font-bold text-primary text-lg">₹{totalRevenue}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-heading text-base">Route Performance</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {schedules.map(schedule => {
                    const routeBookings = confirmedBookings.filter(b => b.scheduleId === schedule.id);
                    const routeRevenue = routeBookings.reduce((sum, b) => sum + b.amount, 0);
                    return (
                      <div key={schedule.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{schedule.source} → {schedule.destination}</span>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{routeBookings.length} bookings</Badge>
                          <span className="font-medium">₹{routeRevenue}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>From</Label>
                <Input value={formSource} onChange={e => setFormSource(e.target.value)} placeholder="Delhi" />
              </div>
              <div className="space-y-1">
                <Label>To</Label>
                <Input value={formDest} onChange={e => setFormDest(e.target.value)} placeholder="Mumbai" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Time</Label>
                <Input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Price (₹)</Label>
                <Input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Total Seats</Label>
                <Input type="number" value={formSeats} onChange={e => setFormSeats(e.target.value)} disabled={!!editingSchedule} />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as 'bus' | 'train')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleSave}>{editingSchedule ? 'Update' : 'Add'} Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
