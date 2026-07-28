"use client";
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Send, CheckCircle, XCircle } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';

export default function SplitPage() {
  const [totalAmount, setTotalAmount] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const splitAmount = members.length > 0 ? (parseFloat(totalAmount) || 0) / members.length : 0;

  const addMember = () => setMembers([...members, '']);
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));
  const updateMember = (i: number, val: string) => { const m = [...members]; m[i] = val; setMembers(m); };

  const sendRequests = async () => {
    setSending(true); setError(''); setSuccess('');
    try {
      const validMembers = members.filter(m => m.trim());
      for (const upiId of validMembers) {
        await axios.post(`${API}/upi/request`, { receiverUpiId: upiId, amount: Math.round(splitAmount * 100) / 100, note: `Split bill: $${totalAmount} among ${validMembers.length + 1} people` }, { headers: h() });
      }
      setSuccess(`Sent $${splitAmount.toFixed(2)} request to ${validMembers.length} people!`);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to send some requests'); }
    finally { setSending(false); }
  };

  return (
    <>
      <header className="mb-8"><h2 className="text-2xl font-bold">Split Bills</h2><p className="text-gray-400">Split expenses with friends easily.</p></header>
      {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl">
          <h3 className="font-bold text-lg mb-6">Create Split</h3>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-300 mb-1">Total Bill Amount ($)</label><input type="number" step="0.01" min="1" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Enter total amount" /></div>
            <div><label className="block text-sm text-gray-300 mb-2">Members (UPI IDs)</label><div className="space-y-2">{members.map((m, i) => (<div key={i} className="flex gap-2"><input value={m} onChange={e => updateMember(i, e.target.value)} placeholder="name@nextgen" className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm" />{members.length > 1 && <button onClick={() => removeMember(i)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>}</div>))}</div><button onClick={addMember} className="mt-2 flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"><Plus className="w-4 h-4" /> Add member</button></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10">
          <Users className="w-10 h-10 text-blue-400 mb-4" />
          <h4 className="text-sm text-gray-400 mb-1">Each Person Pays</h4>
          <p className="text-4xl font-bold text-blue-400 mb-2">${splitAmount.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-6">Split among {members.length + 1} people (including you)</p>
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between"><span className="text-gray-400">Total Bill</span><span className="font-medium">${parseFloat(totalAmount || '0').toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Your Share</span><span className="font-medium text-blue-400">${splitAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Requesting From</span><span className="font-medium">{members.filter(m => m.trim()).length} people</span></div>
          </div>
          <button onClick={sendRequests} disabled={sending || !totalAmount || members.filter(m => m.trim()).length === 0} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Split Requests'}
          </button>
        </motion.div>
      </div>
    </>
  );
}
