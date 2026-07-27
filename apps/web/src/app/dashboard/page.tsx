"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CreditCard, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const API = 'https://banking-system-n4s7.onrender.com';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/auth/login');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [profileRes, cardsRes] = await Promise.all([
          axios.get(`${API}/users/profile`, { headers }),
          axios.get(`${API}/cards`, { headers }),
        ]);
        setUser(profileRes.data);
        setCards(cardsRes.data);
        if (profileRes.data.accounts?.[0]) {
          const txRes = await axios.get(`${API}/transactions/account/${profileRes.data.accounts[0].id}`, { headers });
          setTransactions(txRes.data.slice(0, 5));
        }
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading your financial data...</div>;
  }

  const totalBalance = user?.accounts?.reduce((sum: number, a: any) => sum + a.balance, 0) || 0;

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold">Welcome back, {user?.firstName}</h2>
        <p className="text-gray-400">Here&apos;s your financial overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="w-16 h-16" />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">Total Balance</p>
          <h3 className="text-3xl font-bold mb-4">${totalBalance.toFixed(2)}</h3>
          <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
            <TrendingUp className="w-3 h-3" /> Account Active
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <p className="text-sm font-medium text-gray-400 mb-1">Active Cards</p>
          <h3 className="text-3xl font-bold mb-4">{cards.filter((c: any) => c.status === 'ACTIVE').length}</h3>
          <Link href="/dashboard/cards" className="text-xs text-blue-400 font-medium hover:underline">Apply for a card &rarr;</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <p className="text-sm font-medium text-blue-200 mb-1">Quick Transfer</p>
          <Link href="/dashboard/transfers" className="mt-4 block text-center w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl transition-colors">
            Send Money
          </Link>
        </motion.div>
      </div>

      <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
      {transactions.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-white/5">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No transactions found.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 divide-y divide-white/5">
          {transactions.map((tx: any) => {
            const isSent = tx.fromAccountId === user?.accounts?.[0]?.id;
            return (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    <Activity className={`w-5 h-5 ${isSent ? 'text-red-400' : 'text-green-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{isSent ? 'Sent' : 'Received'}</p>
                    <p className="text-xs text-gray-500">{tx.type} &bull; {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${isSent ? 'text-red-400' : 'text-green-400'}`}>
                  {isSent ? '-' : '+'}${tx.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
