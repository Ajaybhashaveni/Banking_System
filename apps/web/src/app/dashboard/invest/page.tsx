"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Coins, BarChart3, CheckCircle, XCircle } from 'lucide-react';
const API = 'https://banking-system-n4s7.onrender.com';

export default function InvestPage() {
  const [tab, setTab] = useState<'funds' | 'gold' | 'portfolio'>('funds');
  const [funds, setFunds] = useState<any[]>([]);
  const [goldPrice, setGoldPrice] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>({ investments: [], goldHoldings: [] });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [goldGrams, setGoldGrams] = useState('');
  const [selectedFund, setSelectedFund] = useState('');
  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    axios.get(`${API}/investments/funds`, { headers: h() }).then(r => setFunds(r.data));
    axios.get(`${API}/investments/gold-price`, { headers: h() }).then(r => setGoldPrice(r.data));
    axios.get(`${API}/investments/portfolio`, { headers: h() }).then(r => setPortfolio(r.data));
  }, []);

  const buyFund = async () => {
    setProcessing(true); setError(''); setSuccess('');
    try { await axios.post(`${API}/investments/buy-fund`, { fundName: selectedFund, amount: parseFloat(fundAmount) }, { headers: h() }); setSuccess('Investment successful!'); setFundAmount(''); setSelectedFund(''); const r = await axios.get(`${API}/investments/portfolio`, { headers: h() }); setPortfolio(r.data); } catch (err: any) { setError(err.response?.data?.message || 'Failed'); } finally { setProcessing(false); }
  };

  const buyGold = async () => {
    setProcessing(true); setError(''); setSuccess('');
    try { await axios.post(`${API}/investments/buy-gold`, { grams: parseFloat(goldGrams) }, { headers: h() }); setSuccess('Gold purchased!'); setGoldGrams(''); const r = await axios.get(`${API}/investments/portfolio`, { headers: h() }); setPortfolio(r.data); } catch (err: any) { setError(err.response?.data?.message || 'Failed'); } finally { setProcessing(false); }
  };

  const sellGold = async (holdingId: string) => {
    try { await axios.post(`${API}/investments/sell-gold`, { holdingId }, { headers: h() }); const r = await axios.get(`${API}/investments/portfolio`, { headers: h() }); setPortfolio(r.data); setSuccess('Gold sold!'); } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const riskColors: Record<string, string> = { Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-orange-400', 'Very High': 'text-red-400' };
  const totalInvested = portfolio.investments.reduce((s: number, i: any) => s + i.amount, 0) + portfolio.goldHoldings.reduce((s: number, g: any) => s + g.grams * g.purchasePrice, 0);

  return (
    <>
      <header className="mb-8"><h2 className="text-2xl font-bold">Investments</h2><p className="text-gray-400">Grow your wealth with mutual funds & gold.</p></header>
      {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</div>}

      <div className="flex gap-2 mb-6">{(['funds', 'gold', 'portfolio'] as const).map(t => (<button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium ${tab === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{t === 'funds' ? 'Mutual Funds' : t === 'gold' ? 'Digital Gold' : 'My Portfolio'}</button>))}</div>

      {tab === 'funds' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{funds.map((f: any, i: number) => (<motion.div key={f.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`glass-card p-5 rounded-2xl cursor-pointer transition-all ${selectedFund === f.name ? 'border-blue-500 bg-blue-500/10' : 'hover:border-white/20'}`} onClick={() => setSelectedFund(f.name)}><div className="flex justify-between items-start mb-3"><div><p className="font-bold">{f.name}</p><span className="text-xs px-2 py-0.5 rounded-full bg-white/10">{f.type}</span></div><span className={`text-sm font-medium ${riskColors[f.risk]}`}>{f.risk}</span></div><div className="flex justify-between text-sm"><div><p className="text-gray-500">NAV</p><p className="font-bold">${f.nav}</p></div><div><p className="text-gray-500">1Y Returns</p><p className="font-bold text-green-400">+{f.returns1Y}%</p></div><div><p className="text-gray-500">3Y Returns</p><p className="font-bold text-green-400">+{f.returns3Y}%</p></div></div></motion.div>))}
        {selectedFund && <div className="col-span-full glass-card p-6 rounded-2xl"><h4 className="font-bold mb-3">Invest in {selectedFund}</h4><div className="flex gap-3"><input type="number" min="100" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="Amount ($)" className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /><button onClick={buyFund} disabled={processing || !fundAmount} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50">{processing ? '...' : 'Invest'}</button></div></div>}
      </div>}

      {tab === 'gold' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 rounded-2xl max-w-lg">
        <div className="flex items-center gap-4 mb-6"><Coins className="w-12 h-12 text-yellow-400" /><div><p className="text-sm text-gray-400">Gold Price</p><p className="text-3xl font-bold text-yellow-400">${goldPrice?.pricePerGram}/g</p><p className="text-xs text-green-400">+{goldPrice?.change24h}% today</p></div></div>
        <div className="space-y-4"><div><label className="block text-sm text-gray-300 mb-1">Grams to Buy</label><input type="number" step="0.1" min="0.1" value={goldGrams} onChange={e => setGoldGrams(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" /></div>
        {goldGrams && <p className="text-sm text-gray-400">Total: <span className="text-white font-bold">${(parseFloat(goldGrams) * (goldPrice?.pricePerGram || 0)).toFixed(2)}</span></p>}
        <button onClick={buyGold} disabled={processing || !goldGrams} className="w-full py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-semibold disabled:opacity-50">{processing ? 'Processing...' : 'Buy Gold'}</button></div>
      </motion.div>}

      {tab === 'portfolio' && <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10"><p className="text-sm text-gray-400">Total Invested</p><p className="text-3xl font-bold">${totalInvested.toFixed(2)}</p></div>
        {portfolio.investments.length > 0 && <div><h3 className="font-bold mb-3">Mutual Funds</h3><div className="space-y-2">{portfolio.investments.map((inv: any) => (<div key={inv.id} className="glass-card p-4 rounded-xl flex justify-between items-center"><div><p className="font-medium">{inv.fundName}</p><p className="text-xs text-gray-500">{inv.units.toFixed(4)} units @ ${inv.navPrice}</p></div><span className="font-bold">${inv.amount.toFixed(2)}</span></div>))}</div></div>}
        {portfolio.goldHoldings.length > 0 && <div><h3 className="font-bold mb-3">Gold Holdings</h3><div className="space-y-2">{portfolio.goldHoldings.map((g: any) => (<div key={g.id} className="glass-card p-4 rounded-xl flex justify-between items-center"><div><p className="font-medium">{g.grams}g Gold</p><p className="text-xs text-gray-500">Bought @ ${g.purchasePrice}/g</p></div><div className="flex items-center gap-3"><span className="font-bold">${(g.grams * (goldPrice?.pricePerGram || 0)).toFixed(2)}</span><button onClick={() => sellGold(g.id)} className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20">Sell</button></div></div>))}</div></div>}
        {portfolio.investments.length === 0 && portfolio.goldHoldings.length === 0 && <div className="glass-card rounded-2xl p-8 text-center text-gray-500"><BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No investments yet.</p></div>}
      </div>}
    </>
  );
}
