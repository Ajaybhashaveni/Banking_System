"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Zap, Droplets, Flame, Wifi, Tv, Radio, CheckCircle, XCircle } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';
const categoryIcons: Record<string, any> = { ELECTRICITY: Zap, WATER: Droplets, GAS: Flame, INTERNET: Wifi, DTH: Tv, BROADBAND: Radio };

export default function BillsPage() {
  const [providers, setProviders] = useState<Record<string, string[]>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ provider: '', consumerNumber: '', amount: '' });
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    axios.get(`${API}/bills/providers`, { headers: h() }).then(r => setProviders(r.data));
    axios.get(`${API}/bills/history`, { headers: h() }).then(r => setHistory(r.data));
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault(); setProcessing(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/bills/pay`, { category: selectedCategory, provider: form.provider, consumerNumber: form.consumerNumber, amount: parseFloat(form.amount) }, { headers: h() });
      setSuccess('Bill paid successfully!'); setForm({ provider: '', consumerNumber: '', amount: '' }); setSelectedCategory('');
      const r = await axios.get(`${API}/bills/history`, { headers: h() }); setHistory(r.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  return (
    <>
      <header className="mb-8"><h2 className="text-2xl font-bold">Bill Payments</h2><p className="text-gray-400">Pay your utility bills instantly.</p></header>
      {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</div>}

      {!selectedCategory ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
          {Object.keys(providers).map((cat, i) => { const Icon = categoryIcons[cat] || Zap; return (
            <motion.button key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => { setSelectedCategory(cat); setForm({...form, provider: providers[cat][0]}); }} className="glass-card p-6 rounded-2xl text-center hover:border-blue-500/50 transition-all">
              <Icon className="w-10 h-10 text-blue-400 mx-auto mb-3" /><p className="font-medium text-sm">{cat}</p>
            </motion.button>
          ); })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 rounded-2xl max-w-lg">
          <button onClick={() => setSelectedCategory('')} className="text-sm text-gray-400 hover:text-white mb-4">&larr; Back to categories</button>
          <h3 className="font-bold text-lg mb-6">{selectedCategory} Bill Payment</h3>
          <form onSubmit={handlePay} className="space-y-4">
            <div><label className="block text-sm text-gray-300 mb-1">Provider</label><select value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500">{(providers[selectedCategory] || []).map(p => <option key={p} value={p} className="bg-gray-900">{p}</option>)}</select></div>
            <div><label className="block text-sm text-gray-300 mb-1">Consumer Number</label><input value={form.consumerNumber} onChange={e => setForm({...form, consumerNumber: e.target.value})} required placeholder="Enter consumer/account number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm text-gray-300 mb-1">Amount ($)</label><input type="number" step="0.01" min="1" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <button type="submit" disabled={processing} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50">{processing ? 'Processing...' : 'Pay Bill'}</button>
          </form>
        </motion.div>
      )}

      {history.length > 0 && <div className="mt-8 max-w-2xl"><h3 className="font-bold text-lg mb-4">Payment History</h3><div className="space-y-2">{history.map((b: any) => { const Icon = categoryIcons[b.category] || Zap; return (<div key={b.id} className="glass-card p-4 rounded-xl flex items-center justify-between"><div className="flex items-center gap-3"><Icon className="w-5 h-5 text-blue-400" /><div><p className="font-medium text-sm">{b.provider}</p><p className="text-xs text-gray-500">{b.category} • {new Date(b.createdAt).toLocaleDateString()}</p></div></div><span className="font-bold text-red-400">-${b.amount.toFixed(2)}</span></div>); })}</div></div>}
    </>
  );
}
