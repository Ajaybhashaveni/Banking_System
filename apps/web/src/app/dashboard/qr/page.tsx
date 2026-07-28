"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { QrCode, Copy, CheckCircle, XCircle, Send } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';

export default function QrPage() {
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ upiId: '', amount: '' });
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => { axios.get(`${API}/users/profile`, { headers: h() }).then(r => setUser(r.data)); }, []);

  const copyUpi = () => { navigator.clipboard.writeText(user?.upiId || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault(); setProcessing(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/upi/pay`, { receiverUpiId: form.upiId, amount: parseFloat(form.amount), note: 'QR Payment' }, { headers: h() });
      setSuccess('Payment successful!'); setForm({ upiId: '', amount: '' });
      const u = await axios.get(`${API}/users/profile`, { headers: h() }); setUser(u.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  return (
    <>
      <header className="mb-8"><h2 className="text-2xl font-bold">QR Pay</h2><p className="text-gray-400">Share your QR code or scan to pay.</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl text-center">
          <h3 className="font-bold text-lg mb-6">My QR Code</h3>
          <div className="w-64 h-64 mx-auto rounded-2xl bg-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 8px), repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 8px)' }}></div>
            <QrCode className="w-20 h-20 text-black mb-3" />
            <p className="text-black font-mono font-bold text-lg">{user?.upiId}</p>
            <p className="text-gray-600 text-xs mt-1">NextGen Banking</p>
          </div>
          <button onClick={copyUpi} className="mt-6 flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
            {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy UPI ID</>}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-2xl">
          <h3 className="font-bold text-lg mb-6">Pay via QR</h3>
          {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</div>}
          <form onSubmit={handlePay} className="space-y-5">
            <div><label className="block text-sm text-gray-300 mb-1">Recipient UPI ID</label><input value={form.upiId} onChange={e => setForm({...form, upiId: e.target.value})} required placeholder="name@nextgen" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm text-gray-300 mb-1">Amount ($)</label><input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <button type="submit" disabled={processing} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50">{processing ? 'Processing...' : 'Pay Now'}</button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
