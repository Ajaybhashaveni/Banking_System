"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // In a real app we'd add authentication headers for the admin
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('https://banking-system-n4s7.onrender.com/admin/stats');
        setStats(statsRes.data);
        const usersRes = await axios.get('https://banking-system-n4s7.onrender.com/admin/users');
        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const approveKyc = async (userId: string) => {
    try {
      await axios.patch(`https://banking-system-n4s7.onrender.com/admin/kyc/${userId}/approve`);
      setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'APPROVED' } : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Overview</h2>
        <p className="text-gray-400 mt-2">Platform statistics and alerts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Pending KYC</p>
              <h3 className="text-3xl font-bold mt-2">{stats.pendingKyc}</h3>
            </div>
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Transactions</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalTransactions}</h3>
            </div>
            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="p-4 text-sm font-medium text-gray-400">Name</th>
                <th className="p-4 text-sm font-medium text-gray-400">Email</th>
                <th className="p-4 text-sm font-medium text-gray-400">KYC Status</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                  </td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.kycStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {user.kycStatus === 'PENDING' && (
                      <button 
                        onClick={() => approveKyc(user.id)}
                        className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                      >
                        Approve KYC
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
