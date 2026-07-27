"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { LogOut, Send, CreditCard, PieChart, Activity, Shield, Bell } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/auth/login');
      try {
        const res = await axios.get('https://banking-system-n4s7.onrender.com/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: PieChart },
    { name: 'Transfers', href: '/dashboard/transfers', icon: Send },
    { name: 'Cards', href: '/dashboard/cards', icon: CreditCard },
    { name: 'Loans', href: '/dashboard/loans', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 flex flex-col z-20">
        <div className="flex items-center gap-2 mb-12">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight">NextGen</h1>
        </div>
        
        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 font-medium border border-blue-500/20' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" /> {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 w-full text-left text-gray-400 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header (Shared) */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 glass sticky top-0 z-10">
          <div className="text-gray-400">
            {/* Breadcrumb or dynamic title could go here */}
          </div>
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user?.kycStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
              KYC: {user?.kycStatus || 'LOADING'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
