'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-300 to-blue-200">
      <h1 className="text-5xl font-bold mb-10">Welcome to MoodApp 🎵</h1>
      <button
        onClick={() => router.push('/auth')} 
        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700"
      >
        Get Started
      </button>
    </div>
  );
}
