"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import {
  LogOut, Send, CreditCard, PieChart, Activity, Shield, Bell,
  Smartphone, QrCode, Zap, Radio, TrendingUp, Gift, Users, FileText
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
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
        setNotifications(res.data.notifications || []);
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

  const markRead = async () => {
    try {
      await axios.patch('https://banking-system-n4s7.onrender.com/notifications/read', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const navSections = [
    {
      title: 'Payments',
      items: [
        { name: 'Overview', href: '/dashboard', icon: PieChart },
        { name: 'UPI Pay', href: '/dashboard/upi', icon: Smartphone },
        { name: 'QR Pay', href: '/dashboard/qr', icon: QrCode },
        { name: 'Transfers', href: '/dashboard/transfers', icon: Send },
      ]
    },
    {
      title: 'Services',
      items: [
        { name: 'Bills', href: '/dashboard/bills', icon: Zap },
        { name: 'Recharge', href: '/dashboard/recharge', icon: Radio },
        { name: 'Cards', href: '/dashboard/cards', icon: CreditCard },
        { name: 'Loans', href: '/dashboard/loans', icon: Activity },
      ]
    },
    {
      title: 'Wealth',
      items: [
        { name: 'Investments', href: '/dashboard/invest', icon: TrendingUp },
      ]
    },
    {
      title: 'More',
      items: [
        { name: 'Rewards', href: '/dashboard/rewards', icon: Gift },
        { name: 'Split Bills', href: '/dashboard/split', icon: Users },
        { name: 'Statements', href: '/dashboard/statements', icon: FileText },
      ]
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-4 flex flex-col z-20 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Shield className="w-7 h-7 text-blue-500" />
          <h1 className="text-lg font-bold tracking-tight">NextGen</h1>
        </div>
        
        <div className="flex-1 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold px-3 mb-1">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? 'bg-blue-600/20 text-blue-400 font-medium border border-blue-500/20' 
                          : 'hover:bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4" /> {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-4 px-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-gray-500 truncate font-mono">{user?.upiId}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 w-full text-left text-gray-400 transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass sticky top-0 z-10">
          <div></div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markRead(); }} className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl border border-white/10 shadow-2xl max-h-96 overflow-y-auto z-50">
                  <div className="p-3 border-b border-white/10"><p className="font-bold text-sm">Notifications</p></div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                  ) : notifications.slice(0, 10).map((n: any) => (
                    <div key={n.id} className={`p-3 border-b border-white/5 ${!n.read ? 'bg-blue-500/5' : ''}`}>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-400">{n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
