"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

const API = 'https://banking-system-n4s7.onrender.com';

export default function TransfersPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ toAccountNumber: '', amount: '', type: 'NEFT' });
  const router = useRouter();

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/users/profile`, { headers: getHeaders() });
        setUser(res.data);
        if (res.data.accounts?.[0]) {
          const txRes = await axios.get(`${API}/transactions/account/${res.data.accounts[0].id}`, { headers: getHeaders() });
          setTransactions(txRes.data);
        }
      } catch { router.push('/auth/login'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/transactions/transfer`, {
        fromAccountId: user.accounts[0].id,
        toAccountNumber: form.toAccountNumber,
        amount: parseFloat(form.amount),
        type: form.type,
      }, { headers: getHeaders() });
      setSuccess('Transfer completed successfully!');
      setForm({ toAccountNumber: '', amount: '', type: 'NEFT' });
      // Refresh data
      const res = await axios.get(`${API}/users/profile`, { headers: getHeaders() });
      setUser(res.data);
      const txRes = await axios.get(`${API}/transactions/account/${res.data.accounts[0].id}`, { headers: getHeaders() });
      setTransactions(txRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold">Transfers</h2>
        <p className="text-gray-400">Send money to any account instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transfer Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Send Money</h3>
              <p className="text-sm text-gray-400">Available: ${user?.accounts?.[0]?.balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</div>}

          <form onSubmit={handleTransfer} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Account Number</label>
              <input type="text" value={form.toAccountNumber} onChange={e => setForm({...form, toAccountNumber: e.target.value})} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" placeholder="Enter account number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount ($)</label>
              <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Transfer Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="NEFT" className="bg-gray-900">NEFT</option>
                <option value="RTGS" className="bg-gray-900">RTGS</option>
                <option value="IMPS" className="bg-gray-900">IMPS</option>
              </select>
            </div>
            <button type="submit" disabled={sending} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? 'Processing...' : 'Send Money'}
            </button>
          </form>
        </motion.div>

        {/* Transaction History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-2xl">
          <h3 className="font-bold text-lg mb-6">Transaction History</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {transactions.map((tx: any) => {
                const isSent = tx.fromAccountId === user?.accounts?.[0]?.id;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                        {isSent ? <ArrowUpRight className="w-5 h-5 text-red-400" /> : <ArrowDownLeft className="w-5 h-5 text-green-400" />}
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
        </motion.div>
      </div>
    </>
  );
}
