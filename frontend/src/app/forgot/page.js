'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Icons
import { Music, Mail, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
        toast.error("Please enter your email address.");
        return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || 'If an account with that email exists, a reset link has been sent.');
        // Optionally redirect the user or clear the form
        // router.push('/auth');
      } else {
        toast.error(data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] text-gray-200 p-4 font-sans">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center h-16 mb-4">
                <Music size={48} className="text-pink-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Forgot Password
            </h1>
            <p className="text-gray-400 mt-2">Enter your email to receive a password reset link.</p>
        </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-900/50 border border-purple-800/50 rounded-2xl shadow-xl shadow-purple-900/10 p-8"
      >
        <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center w-full h-12 mt-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
        </form>
      </motion.div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/auth')}
          className="text-purple-400 hover:text-pink-400 underline transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}