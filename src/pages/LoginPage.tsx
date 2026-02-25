import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Ticket, Shield } from 'lucide-react';

const LoginPage = () => {
  const { login, register } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'user' | 'admin'>('user');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = (role: 'user' | 'admin') => {
    if (login(loginEmail, loginPassword, role)) {
      toast.success('Login successful!');
      navigate(role === 'admin' ? '/admin' : '/user');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleRegister = () => {
    if (!regName || !regEmail || !regPhone || !regPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (register(regName, regEmail, regPhone, regPassword)) {
      toast.success('Registration successful!');
      navigate('/user');
    } else {
      toast.error('Email already exists');
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Ticket className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-primary-foreground">E-Ticket</h1>
          </div>
          <p className="text-muted-foreground">Book your journey in seconds</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'user' | 'admin')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="user" className="flex items-center gap-2"><Ticket className="h-4 w-4" />User</TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2"><Shield className="h-4 w-4" />Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">User Login / Register</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-foreground">Login</h3>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="user@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={() => handleLogin('user')}>Login as User</Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or register</span></div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="GIAN" value={regName} onChange={e => setRegName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="gian@gmail.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="1234567880" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleRegister}>Register</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Admin Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="admin@eticket.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                </div>
                <Button className="w-full" onClick={() => handleLogin('admin')}>Login as Admin</Button>
                <p className="text-xs text-muted-foreground text-center">Default: admin@eticket.com / admin123</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
