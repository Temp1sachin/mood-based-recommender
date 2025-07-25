'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Icons
import { Music, User, Mail, Lock, Upload, ArrowRight } from 'lucide-react';

export default function Auth() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    profilePic: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePic') {
      setForm({ ...form, profilePic: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;

      if (isSignup) {
        const formData = new FormData();
        formData.append('fullName', form.fullName);
        formData.append('email', form.email);
        formData.append('password', form.password);
        if (form.profilePic) {
            formData.append('profilePic', form.profilePic);
        }

        res = await fetch('http://localhost:8000/api/auth/signup', {
          method: 'POST',
          body: formData,
        });
        
      } else {
        res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Something went wrong!');
        return;
      }
      
      localStorage.setItem('token', data.token);
      toast.success(`${isSignup ? 'Signed up' : 'Logged in'} successfully!`);

      if(isSignup) {
        router.push(`/verify?email=${encodeURIComponent(form.email)}`);
      } else {
        router.push(`/dashboard`);
      }

    } catch (err) {
      console.error(err);
      toast.error('Network error! Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] text-gray-200 p-4 font-sans">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center h-16 mb-4">
                <Music size={48} className="text-pink-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome to Blend
            </h1>
            <p className="text-gray-400 mt-2">{isSignup ? 'Create your account to start blending.' : 'Login to continue your session.'}</p>
        </div>

      <div className="w-full max-w-md bg-gray-900/50 border border-purple-800/50 rounded-2xl shadow-xl shadow-purple-900/10 p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignup ? 'signup' : 'login'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {isSignup && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text" name="fullName" placeholder="Full Name"
                    className="w-full h-12 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    onChange={handleChange} required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email" name="email" placeholder="Email"
                  className="w-full h-12 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  onChange={handleChange} required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password" name="password" placeholder="Password"
                  className="w-full h-12 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  onChange={handleChange} required
                />
              </div>
              {isSignup && (
                <label htmlFor="profilePic" className="cursor-pointer bg-gray-800 border border-dashed border-gray-700 rounded-lg p-3 h-12 flex items-center justify-center text-gray-400 hover:border-pink-500 hover:text-pink-400 transition-colors">
                  <Upload className="h-5 w-5 mr-2"/>
                  <span className="truncate">{form.profilePic ? form.profilePic.name : 'Upload Profile Picture'}</span>
                </label>
              )}
              <input
                id="profilePic" type="file" name="profilePic" className="hidden"
                onChange={handleChange} accept="image/*"
              />
              
              <button type="submit" disabled={loading} className="flex items-center justify-center w-full h-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="text-purple-400 hover:text-pink-400 underline transition-colors"
        >
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>
        {!isSignup && (
          <button
            onClick={() => router.push(`/forgot?email=${encodeURIComponent(form.email)}`)}
            className="mt-2 block text-sm text-gray-500 hover:text-gray-300 underline"
          >
            Forgot Password?
          </button>
        )}
      </div>
    </div>
  );
}
