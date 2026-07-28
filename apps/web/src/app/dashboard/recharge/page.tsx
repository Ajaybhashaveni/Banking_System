"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, XCircle, Signal } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';

export default function RechargePage() {
  const [operators, setOperators] = useState<string[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ mobileNumber: '', operator: '', planType: 'PREPAID' });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => { axios.get(`${API}/recharge/operators`, { headers: h() }).then(r => setOperators(r.data)); }, []);

  const fetchPlans = async (op: string) => {
    setForm({...form, operator: op});
    const r = await axios.get(`${API}/recharge/plans/${op}`, { headers: h() });
    setPlans(r.data); setSelectedPlan(null);
  };

  const handleRecharge = async () => {
    if (!selectedPlan) return; setProcessing(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/recharge/pay`, { mobileNumber: form.mobileNumber, operator: form.operator, planType: form.planType, amount: selectedPlan.amount, planDetails: selectedPlan.name }, { headers: h() });
      setSuccess(`Recharge of $${selectedPlan.amount} successful!`); setSelectedPlan(null); setPlans([]); setForm({ mobileNumber: '', operator: '', planType: 'PREPAID' });
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  return (
    <>
      <header className="mb-8"><h2 className="text-2xl font-bold">Mobile Recharge</h2><p className="text-gray-400">Recharge any mobile number instantly.</p></header>
      {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</div>}

      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-300 mb-1">Mobile Number</label><input value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} placeholder="Enter 10-digit number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div>
            <div className="flex gap-2">{['PREPAID', 'POSTPAID'].map(t => (<button key={t} onClick={() => setForm({...form, planType: t})} className={`px-4 py-2 rounded-xl text-sm font-medium ${form.planType === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}>{t}</button>))}</div>
            <div><label className="block text-sm text-gray-300 mb-2">Select Operator</label><div className="grid grid-cols-4 gap-3">{operators.map(op => (<button key={op} onClick={() => fetchPlans(op)} className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${form.operator === op ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}><Signal className="w-5 h-5 mx-auto mb-1" />{op}</button>))}</div></div>
          </div>
        </motion.div>

        {plans.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <h3 className="font-bold text-lg">Select Plan</h3>
            {plans.map((plan: any, i: number) => (
              <button key={i} onClick={() => setSelectedPlan(plan)} className={`w-full glass-card p-4 rounded-xl text-left transition-all ${selectedPlan?.name === plan.name ? 'border-blue-500 bg-blue-500/10' : 'hover:border-white/20'}`}>
                <div className="flex justify-between items-center">
                  <div><p className="font-medium">{plan.name}</p><p className="text-xs text-gray-500">{plan.validity} • {plan.data}</p><p className="text-xs text-gray-500">{plan.details}</p></div>
                  <span className="text-xl font-bold text-blue-400">${plan.amount}</span>
                </div>
              </button>
            ))}
            {selectedPlan && <button onClick={handleRecharge} disabled={processing || !form.mobileNumber} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50">{processing ? 'Processing...' : `Recharge $${selectedPlan.amount}`}</button>}
          </motion.div>
        )}
      </div>
    </>
  );
}
