import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ticket, ArrowRight, Train, Bus, Shield, MapPin, Clock, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground min-h-[70vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Ticket className="h-12 w-12 text-primary" />
              <h1 className="text-5xl md:text-6xl font-heading font-bold">E-Ticket</h1>
            </div>
            <p className="text-xl md:text-2xl mb-4 opacity-90 font-heading">
              Book your journey in seconds
            </p>
            <p className="text-base opacity-70 mb-8 max-w-lg">
              Search schedules, select seats, and get instant e-tickets for buses and trains across India. Fast, reliable, and hassle-free.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate('/login')}>
                Book Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/login')}>
                <Shield className="mr-2 h-5 w-5" /> Admin Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Why Choose E-Ticket?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Instant Booking', desc: 'Book tickets in under 60 seconds with our streamlined process.' },
              { icon: MapPin, title: 'Wide Coverage', desc: 'Trains and buses across all major routes in India.' },
              { icon: CheckCircle, title: 'Easy Cancellation', desc: 'Cancel anytime with instant refund processing.' },
            ].map(feature => (
              <div key={feature.title} className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                <feature.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Train className="h-8 w-8" />
            <Bus className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to travel?</h2>
          <p className="opacity-80 mb-6">Register now and get started with your first booking</p>
          <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate('/login')}>
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 E-Ticket System — Built by Jogeender, Jatin & Jatin</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
