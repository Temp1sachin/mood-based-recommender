'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
 const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Icons
import { Music, Key, Mail, ArrowRight } from 'lucide-react';

export default function OTPVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Your original state and logic are preserved
  const emailFromQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Set email from URL query on initial render
  useEffect(() => {
    if (emailFromQuery) {
        setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);


  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        toast.success('Account verified! Redirecting to your dashboard...');
        router.push('/dashboard');
      } else {
        toast.error('Something went wrong during verification.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please check the OTP.');
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
                Verify Your Account
            </h1>
            <p className="text-gray-400 mt-2">Enter the OTP sent to your email to complete registration.</p>
        </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-900/50 border border-purple-800/50 rounded-2xl shadow-xl shadow-purple-900/10 p-8"
      >
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="email"
              value={email}
              readOnly
              className="w-full h-12 pl-10 pr-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-not-allowed"
            />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center w-full h-12 mt-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Account'}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}