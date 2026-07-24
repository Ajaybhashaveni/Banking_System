"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null);
      const res = await axios.post('https://banking-system-n4s7.onrender.com/auth/register', data);
      localStorage.setItem('token', res.data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 rounded-3xl w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-gray-400">Join NextGen Banking today</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
            <input 
              {...register('firstName')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="John"
            />
            {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
            <input 
              {...register('lastName')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
          <input 
            {...register('email')}
            type="email"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input 
            {...register('password')}
            type="password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 mt-4"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
