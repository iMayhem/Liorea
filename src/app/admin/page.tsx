"use client";

import { useState, useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_ID = "sujeet";
const ADMIN_PASS = "123";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uid, setUid] = useState("");
  const [pass, setPass] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("admin_auth");
    if (sessionAuth === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (uid === ADMIN_ID && pass === ADMIN_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      toast({ title: "Welcome back", description: "Admin access granted." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

  return (
    <div className="h-screen flex flex-col text-white">
      <Header />
      <main className="flex-1 overflow-y-auto container mx-auto pt-24 pb-12 px-4 no-scrollbar flex items-center justify-center">
        {isAuthenticated ? (
          <div className="w-full max-w-4xl mx-auto h-full block">
            <AdminDashboard />
          </div>
        ) : (
          <Card className="w-full max-w-sm bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-center text-white">Admin Access</CardTitle>
              <CardDescription className="text-center text-white/50">Restricted area. Identify yourself.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="User ID"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full bg-white text-black hover:bg-white/90">
                Enter Console
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
