"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Trophy, Sparkles, CheckCircle } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';

export default function RewardsPage() {
  const [balance, setBalance] = useState<any>({ points: 0, cashValue: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [scratchResult, setScratchResult] = useState<any>(null);
  const [showScratch, setShowScratch] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const refresh = () => {
    axios.get(`${API}/rewards/balance`, { headers: h() }).then(r => setBalance(r.data));
    axios.get(`${API}/rewards/history`, { headers: h() }).then(r => setHistory(r.data));
  };
  useEffect(() => { refresh(); }, []);

  const handleRedeem = async () => {
    setProcessing(true);
    try { await axios.post(`${API}/rewards/redeem`, { points: parseInt(redeemAmount) }, { headers: h() }); setSuccess('Points redeemed!'); setRedeemAmount(''); refresh(); } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleScratch = async () => {
    const r = await axios.post(`${API}/rewards/scratch-card`, {}, { headers: h() });
    setScratchResult(r.data); setShowScratch(true); setScratched(false); refresh();
  };

  return (
    <>
      <header className="mb-8"><h2 className="text-2xl font-bold">Rewards</h2><p className="text-gray-400">Earn & redeem points on every transaction.</p></header>
      {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/20">
          <Star className="w-8 h-8 text-yellow-400 mb-2" /><p className="text-sm text-gray-400">Total Points</p><p className="text-3xl font-bold text-yellow-400">{balance.points}</p><p className="text-xs text-gray-500 mt-1">Worth ${balance.cashValue.toFixed(2)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
          <Trophy className="w-8 h-8 text-blue-400 mb-2" /><p className="text-sm text-gray-400 mb-3">Redeem Points</p>
          <div className="flex gap-2"><input type="number" min="100" value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)} placeholder="Min 100" className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500" /><button onClick={handleRedeem} disabled={processing} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">Redeem</button></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl text-center cursor-pointer hover:border-yellow-500/30 transition-all" onClick={handleScratch}>
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" /><p className="text-sm text-gray-400 mb-1">Scratch Card</p><p className="font-bold text-purple-400">Try Your Luck!</p>
        </motion.div>
      </div>

      <AnimatePresence>{showScratch && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowScratch(false)}>
          <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="w-72 h-44 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-1 cursor-pointer" onClick={e => { e.stopPropagation(); setScratched(true); }}>
            {!scratched ? <div className="w-full h-full rounded-xl bg-gray-700 flex items-center justify-center"><p className="text-gray-400 text-lg font-bold">TAP TO SCRATCH</p></div> : <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-900 to-pink-900 flex flex-col items-center justify-center">{scratchResult?.points > 0 ? <><Sparkles className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" /><p className="text-3xl font-bold text-yellow-400">{scratchResult.points} pts!</p><p className="text-sm text-gray-300">{scratchResult.message}</p></> : <><Gift className="w-12 h-12 text-gray-400 mb-2" /><p className="text-gray-300">{scratchResult?.message}</p></>}</div>}
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {history.length > 0 && <div><h3 className="font-bold text-lg mb-4">Rewards History</h3><div className="space-y-2 max-w-lg">{history.map((r: any) => (<div key={r.id} className="glass-card p-4 rounded-xl flex justify-between items-center"><div><p className="font-medium text-sm">{r.description}</p><p className="text-xs text-gray-500">{r.type} • {new Date(r.createdAt).toLocaleDateString()}</p></div><span className={`font-bold ${r.points > 0 ? 'text-green-400' : 'text-red-400'}`}>{r.points > 0 ? '+' : ''}{r.points}</span></div>))}</div></div>}
    </>
  );
}
