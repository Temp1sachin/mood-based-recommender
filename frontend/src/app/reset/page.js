// This file should be at: app/(auth)/reset-password/page.js

import { Suspense } from 'react';
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
 const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Icons
import { Music, Key, Lock, ArrowRight, LoaderCircle } from 'lucide-react';

// This is the actual component with all your original logic.
// It's now a separate component that can be wrapped in Suspense.
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Your original state and logic are preserved
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const emailFromQuery = searchParams.get('email') || '';

  useEffect(() => {
      if (emailFromQuery) {
        setEmail(emailFromQuery);
      }
    }, [emailFromQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      } else {
        toast.error(data.message || 'Reset failed. Please check your OTP.');
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
                Reset Your Password
            </h1>
            <p className="text-gray-400 mt-2">Enter the OTP sent to your email and a new password.</p>
        </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-900/50 border border-purple-800/50 rounded-2xl shadow-xl shadow-purple-900/10 p-8"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full h-12 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="password"
              placeholder="New Password"
              className="w-full h-12 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center w-full h-12 mt-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// This is the main page component that Next.js will render.
// It wraps our form in a <Suspense> boundary to fix the error.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d]">
            <LoaderCircle className="w-10 h-10 text-purple-400 animate-spin" />
        </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}