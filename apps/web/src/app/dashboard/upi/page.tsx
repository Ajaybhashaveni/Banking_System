"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Smartphone, Send, ArrowDownLeft, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';

export default function UpiPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'send' | 'request' | 'pending'>('send');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ receiverUpiId: '', amount: '', note: '' });
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/users/profile`, { headers: h() }),
      axios.get(`${API}/upi/requests`, { headers: h() }),
    ]).then(([u, r]) => { setUser(u.data); setRequests(r.data); }).finally(() => setLoading(false));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); setProcessing(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/upi/pay`, { receiverUpiId: form.receiverUpiId, amount: parseFloat(form.amount), note: form.note }, { headers: h() });
      setSuccess('Payment successful!'); setForm({ receiverUpiId: '', amount: '', note: '' });
      const u = await axios.get(`${API}/users/profile`, { headers: h() }); setUser(u.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault(); setProcessing(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/upi/request`, { receiverUpiId: form.receiverUpiId, amount: parseFloat(form.amount), note: form.note }, { headers: h() });
      setSuccess('Request sent!'); setForm({ receiverUpiId: '', amount: '', note: '' });
      const r = await axios.get(`${API}/upi/requests`, { headers: h() }); setRequests(r.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleRespond = async (id: string, action: string) => {
    try {
      await axios.patch(`${API}/upi/requests/${id}`, { action }, { headers: h() });
      const r = await axios.get(`${API}/upi/requests`, { headers: h() }); setRequests(r.data);
      const u = await axios.get(`${API}/users/profile`, { headers: h() }); setUser(u.data);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  const pendingForMe = requests.filter((r: any) => r.receiverId === user?.id && r.status === 'PENDING');

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold">UPI Payments</h2>
        <p className="text-gray-400">Your UPI ID: <span className="text-blue-400 font-mono font-bold">{user?.upiId}</span></p>
      </header>
      <div className="flex gap-2 mb-6">
        {(['send', 'request', 'pending'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            {t === 'send' ? 'Send Money' : t === 'request' ? 'Request Money' : `Pending (${pendingForMe.length})`}
          </button>
        ))}
      </div>

      {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</div>}

      {(tab === 'send' || tab === 'request') && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
              {tab === 'send' ? <Send className="w-6 h-6 text-blue-400" /> : <ArrowDownLeft className="w-6 h-6 text-green-400" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">{tab === 'send' ? 'Send via UPI' : 'Request Money'}</h3>
              <p className="text-sm text-gray-400">Balance: ${user?.accounts?.[0]?.balance?.toFixed(2)}</p>
            </div>
          </div>
          <form onSubmit={tab === 'send' ? handleSend : handleRequest} className="space-y-4">
            <div><label className="block text-sm text-gray-300 mb-1">UPI ID</label><input value={form.receiverUpiId} onChange={e => setForm({...form, receiverUpiId: e.target.value})} required placeholder="name@nextgen" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm text-gray-300 mb-1">Amount ($)</label><input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm text-gray-300 mb-1">Note (optional)</label><input value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="What's this for?" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <button type="submit" disabled={processing} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50">{processing ? 'Processing...' : tab === 'send' ? 'Pay Now' : 'Send Request'}</button>
          </form>
        </motion.div>
      )}

      {tab === 'pending' && (
        <div className="space-y-3 max-w-lg">
          {pendingForMe.length === 0 ? <div className="glass-card rounded-2xl p-8 text-center text-gray-500"><Clock className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No pending requests</p></div> : pendingForMe.map((r: any) => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div><p className="font-medium">{r.sender.firstName} {r.sender.lastName}</p><p className="text-xs text-gray-500">{r.sender.upiId} • {r.note || 'No note'}</p></div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">${r.amount}</span>
                <button onClick={() => handleRespond(r.id, 'PAID')} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20">Pay</button>
                <button onClick={() => handleRespond(r.id, 'DECLINED')} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20">Decline</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
