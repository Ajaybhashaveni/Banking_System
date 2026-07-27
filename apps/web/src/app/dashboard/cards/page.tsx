"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Shield, Eye, EyeOff, Snowflake, Zap } from 'lucide-react';

const API = 'https://banking-system-n4s7.onrender.com';

const cardGradients = [
  'from-blue-600 via-blue-700 to-indigo-800',
  'from-purple-600 via-purple-700 to-pink-800',
  'from-emerald-600 via-emerald-700 to-teal-800',
  'from-orange-600 via-orange-700 to-red-800',
];

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showCvv, setShowCvv] = useState<Record<string, boolean>>({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const router = useRouter();

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchCards = async () => {
    try {
      const res = await axios.get(`${API}/cards`, { headers: getHeaders() });
      setCards(res.data);
    } catch { router.push('/auth/login'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const applyCard = async (cardType: string) => {
    setApplying(true);
    try {
      await axios.post(`${API}/cards/apply`, { cardType }, { headers: getHeaders() });
      await fetchCards();
      setShowApplyModal(false);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  const toggleFreeze = async (cardId: string) => {
    try {
      await axios.patch(`${API}/cards/${cardId}/freeze`, {}, { headers: getHeaders() });
      await fetchCards();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const formatCardNumber = (num: string) => num.replace(/(.{4})/g, '$1 ').trim();

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Cards</h2>
          <p className="text-gray-400">Manage your virtual and physical cards.</p>
        </div>
        <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
          <Plus className="w-5 h-5" /> New Card
        </button>
      </header>

      {/* Apply Modal */}
      {showApplyModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 rounded-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">Choose Card Type</h3>
            <div className="space-y-3">
              {['DEBIT', 'CREDIT', 'VIRTUAL'].map(type => (
                <button key={type} onClick={() => applyCard(type)} disabled={applying} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-medium">{type} Card</p>
                        <p className="text-xs text-gray-500">{type === 'DEBIT' ? 'Linked to your savings' : type === 'CREDIT' ? 'Credit line up to $5,000' : 'For online purchases'}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowApplyModal(false)} className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
          </motion.div>
        </motion.div>
      )}

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No cards yet</h3>
          <p className="text-gray-500 mb-6">Apply for your first virtual card to get started.</p>
          <button onClick={() => setShowApplyModal(true)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">Apply Now</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card: any, i: number) => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              {/* Card Visual */}
              <div className={`relative rounded-2xl p-6 bg-gradient-to-br ${cardGradients[i % cardGradients.length]} aspect-[1.6/1] flex flex-col justify-between shadow-2xl ${card.status === 'FROZEN' ? 'opacity-60 grayscale' : ''}`}>
                {card.status === 'FROZEN' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl z-10">
                    <Snowflake className="w-16 h-16 text-blue-200 animate-pulse" />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <Shield className="w-10 h-10 text-white/30" />
                  <span className="text-white/70 text-sm font-medium">{card.cardType}</span>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1 tracking-widest">CARD NUMBER</p>
                  <p className="text-xl font-mono text-white tracking-[0.15em]">{formatCardNumber(card.cardNumber)}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/60 text-xs">EXPIRES</p>
                    <p className="text-white font-mono">{card.expiryDate}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">CVV</p>
                    <p className="text-white font-mono">{showCvv[card.id] ? card.cvv : '•••'}</p>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowCvv(prev => ({...prev, [card.id]: !prev[card.id]}))} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-sm text-gray-300 hover:text-white transition-all">
                  {showCvv[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showCvv[card.id] ? 'Hide CVV' : 'Reveal CVV'}
                </button>
                <button onClick={() => toggleFreeze(card.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-all ${card.status === 'FROZEN' ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}>
                  {card.status === 'FROZEN' ? <Zap className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                  {card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
