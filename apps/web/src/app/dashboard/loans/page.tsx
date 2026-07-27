"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Landmark, Home, Car, Wallet, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const API = 'https://banking-system-n4s7.onrender.com';

const loanIcons: Record<string, any> = { HOME: Home, CAR: Car, PERSONAL: Wallet };
const loanRates: Record<string, number> = { HOME: 8.5, CAR: 9.5, PERSONAL: 12.0 };

function calculateEMI(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ loanType: 'HOME', amount: '500000', tenureMonths: 60 });
  const router = useRouter();

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API}/loans`, { headers: getHeaders() });
      setLoans(res.data);
    } catch { router.push('/auth/login'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      await axios.post(`${API}/loans/apply`, {
        loanType: form.loanType,
        amount: parseFloat(form.amount),
        tenureMonths: form.tenureMonths,
      }, { headers: getHeaders() });
      await fetchLoans();
      setShowForm(false);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  const emi = calculateEMI(parseFloat(form.amount) || 0, loanRates[form.loanType], form.tenureMonths);
  const totalPayable = emi * form.tenureMonths;
  const totalInterest = totalPayable - (parseFloat(form.amount) || 0);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
    ACTIVE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    CLOSED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  const statusIcons: Record<string, any> = { PENDING: Clock, APPROVED: CheckCircle, ACTIVE: CheckCircle, REJECTED: XCircle, CLOSED: XCircle };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Loans</h2>
          <p className="text-gray-400">Apply for loans and track your applications.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
          <Plus className="w-5 h-5" /> Apply for Loan
        </button>
      </header>

      {/* Apply Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-8 rounded-2xl mb-8">
          <h3 className="text-lg font-bold mb-6">Loan Application</h3>
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Loan Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['HOME', 'CAR', 'PERSONAL'] as const).map(type => {
                    const Icon = loanIcons[type];
                    return (
                      <button key={type} type="button" onClick={() => setForm({...form, loanType: type})} className={`p-4 rounded-xl border text-center transition-all ${form.loanType === type ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}>
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-xs font-medium">{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Loan Amount ($)</label>
                <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required min="1000" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tenure: {form.tenureMonths} months ({(form.tenureMonths / 12).toFixed(1)} years)</label>
                <input type="range" min="12" max="360" step="12" value={form.tenureMonths} onChange={e => setForm({...form, tenureMonths: parseInt(e.target.value)})} className="w-full accent-blue-500" />
              </div>
              <button type="submit" disabled={applying} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>

            {/* EMI Preview */}
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20 flex flex-col justify-center">
              <Landmark className="w-10 h-10 text-blue-400 mb-4" />
              <h4 className="text-sm text-gray-400 mb-1">Monthly EMI</h4>
              <p className="text-4xl font-bold text-blue-400 mb-6">${emi.toFixed(2)}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Interest Rate</span><span className="font-medium">{loanRates[form.loanType]}%</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Interest</span><span className="font-medium text-orange-400">${totalInterest.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Payable</span><span className="font-medium">${totalPayable.toFixed(2)}</span></div>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Existing Loans */}
      {loans.length === 0 && !showForm ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-12 text-center">
          <Landmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No active loans</h3>
          <p className="text-gray-500 mb-6">Apply for a loan to see it here.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map((loan: any, i: number) => {
            const Icon = loanIcons[loan.loanType] || Landmark;
            const StatusIcon = statusIcons[loan.status] || Clock;
            return (
              <motion.div key={loan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold">{loan.loanType} Loan</p>
                      <p className="text-xs text-gray-500">Applied {new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusColors[loan.status]}`}>
                    <StatusIcon className="w-3 h-3" /> {loan.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Amount</p><p className="font-bold">${loan.amount.toLocaleString()}</p></div>
                  <div><p className="text-gray-500">EMI</p><p className="font-bold">${loan.emiAmount.toFixed(2)}</p></div>
                  <div><p className="text-gray-500">Tenure</p><p className="font-bold">{loan.tenureMonths}mo</p></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
