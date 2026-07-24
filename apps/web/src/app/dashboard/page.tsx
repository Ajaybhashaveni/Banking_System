"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, Send, CreditCard, PieChart, Activity, User, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      try {
        const res = await axios.get('http://localhost:3001/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 flex flex-col z-20">
        <div className="flex items-center gap-2 mb-12">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight">NextGen</h1>
        </div>
        
        <div className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium border border-blue-500/20">
            <PieChart className="w-5 h-5" /> Overview
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 w-full text-left text-gray-400 hover:text-white transition-colors">
            <Send className="w-5 h-5" /> Transfers
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 w-full text-left text-gray-400 hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" /> Cards
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 w-full text-left text-gray-400 hover:text-white transition-colors">
            <Activity className="w-5 h-5" /> Transactions
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 w-full text-left text-gray-400 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.firstName}</h2>
            <p className="text-gray-400">Here's your financial overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user?.kycStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
              KYC: {user?.kycStatus}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Total Balance</p>
            <h3 className="text-3xl font-bold mb-4">$0.00</h3>
            <div className="text-xs text-green-400 font-medium">+0.00% from last month</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <p className="text-sm font-medium text-gray-400 mb-1">Active Cards</p>
            <h3 className="text-3xl font-bold mb-4">0</h3>
            <button className="text-xs text-blue-400 font-medium hover:underline">Apply for a card &rarr;</button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <p className="text-sm font-medium text-blue-200 mb-1">Quick Transfer</p>
            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl transition-colors">
              Send Money
            </button>
          </motion.div>
        </div>

        <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
        <div className="glass-card rounded-2xl p-8 text-center border border-white/5">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No transactions found.</p>
        </div>
      </main>
    </div>
  );
}
