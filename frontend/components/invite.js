'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BlendInvitePoller() {
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/blend/pending-invites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { invites } = await res.json();
      if (invites?.length) {
        const inv = invites[0];
        toast(
          (t) => (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900 via-black to-pink-800 text-white shadow-lg flex flex-col items-center min-w-[220px]">
              <div className="mb-3 text-lg font-bold text-pink-300 text-center">
                {inv.senderId.fullName} wants to blend with you!
              </div>
              <button
                onClick={async () => {
                  await fetch('http://localhost:8000/blend/respond', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ inviteId: inv._id, action: 'accepted' })
                  });
                  toast.dismiss(t.id);
                  router.push(`/blend/${inv.roomId}`);
                }}
                className="mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-white"
              >
                Accept
              </button>
            </div>
          ),
          { duration: Infinity }
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return null;
}
