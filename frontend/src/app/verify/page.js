'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';



export default function OTPVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/auth/verify-otp', {
        email,
        otp
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setMsg('Verified! Redirecting...');
        router.push('/dashboard');
      } else {
        setMsg('Something went wrong.');
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100 px-4">
      <div className="bg-black shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-black-2xl font-bold mb-4 text-center">Verify OTP</h2>
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
  <input
    type="email"
    value={email}
    readOnly
    className="p-2 border rounded bg-black-100"
  />

  <input
    type="text"
    placeholder="Enter OTP"
    value={otp}
    onChange={(e) => setOtp(e.target.value)}
    className="p-2 border rounded"
    required
  />

  <button
    type="submit"
    className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
    disabled={loading}
  >
    {loading ? 'Verifying...' : 'Verify OTP'}
  </button>
</form>

        {msg && <p className="mt-4 text-center text-sm text-red-500">{msg}</p>}
      </div>
    </div>
  );
}
