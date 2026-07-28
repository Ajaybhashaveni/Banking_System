"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Download, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';

export default function StatementsPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const fetch = async () => {
      try {
        const u = await axios.get(`${API}/users/profile`, { headers: h() }); setUser(u.data);
        if (u.data.accounts?.[0]) { const t = await axios.get(`${API}/transactions/account/${u.data.accounts[0].id}`, { headers: h() }); setTransactions(t.data); setFiltered(t.data); }
      } catch {} finally { setLoading(false); }
    }; fetch();
  }, []);

  useEffect(() => {
    let result = transactions;
    if (typeFilter !== 'ALL') result = result.filter((t: any) => t.type === typeFilter);
    if (search) result = result.filter((t: any) => t.description?.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase()) || t.referenceId.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, typeFilter, transactions]);

  const downloadCSV = () => {
    const headers = 'Date,Reference,Type,Description,Amount,Status\n';
    const rows = filtered.map((t: any) => `${new Date(t.createdAt).toLocaleDateString()},${t.referenceId},${t.type},${t.description || ''},${t.amount},${t.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'statement.csv'; a.click();
  };

  const types = ['ALL', ...new Set(transactions.map((t: any) => t.type))];
  const totalIn = filtered.filter((t: any) => t.toAccountId === user?.accounts?.[0]?.id).reduce((s: number, t: any) => s + t.amount, 0);
  const totalOut = filtered.filter((t: any) => t.fromAccountId === user?.accounts?.[0]?.id).reduce((s: number, t: any) => s + t.amount, 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <>
      <header className="flex justify-between items-center mb-8"><div><h2 className="text-2xl font-bold">Statements</h2><p className="text-gray-400">Search, filter & download your transaction history.</p></div><button onClick={downloadCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"><Download className="w-5 h-5" /> Download CSV</button></header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-xl"><p className="text-xs text-gray-500">Total Transactions</p><p className="text-2xl font-bold">{filtered.length}</p></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 rounded-xl"><p className="text-xs text-gray-500">Money In</p><p className="text-2xl font-bold text-green-400">${totalIn.toFixed(2)}</p></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 rounded-xl"><p className="text-xs text-gray-500">Money Out</p><p className="text-2xl font-bold text-red-400">${totalOut.toFixed(2)}</p></motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
        <div className="flex gap-2 flex-wrap">{types.map(t => (<button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-2 rounded-lg text-xs font-medium ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{t}</button>))}</div>
      </div>

      <div className="space-y-2">{filtered.length === 0 ? <div className="glass-card rounded-2xl p-8 text-center text-gray-500"><Filter className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No transactions match your filters.</p></div> : filtered.map((tx: any) => { const isSent = tx.fromAccountId === user?.accounts?.[0]?.id; return (<motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-red-500/10' : 'bg-green-500/10'}`}>{isSent ? <ArrowUpRight className="w-5 h-5 text-red-400" /> : <ArrowDownLeft className="w-5 h-5 text-green-400" />}</div><div><p className="font-medium text-sm">{tx.description || (isSent ? 'Sent' : 'Received')}</p><p className="text-xs text-gray-500">{tx.type} • {tx.referenceId} • {new Date(tx.createdAt).toLocaleDateString()}</p></div></div><span className={`font-bold ${isSent ? 'text-red-400' : 'text-green-400'}`}>{isSent ? '-' : '+'}${tx.amount.toFixed(2)}</span></motion.div>); })}</div>
    </>
  );
}
