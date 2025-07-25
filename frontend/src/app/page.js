'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time delay between each child animation
      },
    },
  };

  // Animation for individual items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#0d0d0d] text-gray-200 p-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-72 h-72 md:w-96 md:h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-72 h-72 md:w-96 md:h-96 bg-pink-600/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-4xl"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center h-20 mb-4">
          <Music size={64} className="text-pink-500" />
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 drop-shadow-lg"
        >
          MoodyBlu
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-purple-200/80 mb-10"
        >
          Discover music and movies that perfectly match your vibe. Our AI analyzes your mood to recommend content you'll love.
        </motion.p>

        {/* Blend Feature Section with improved responsiveness and hover animation */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.03, borderColor: 'rgba(217, 70, 239, 0.5)' }} // Pink-400
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 bg-gray-900/50 border border-purple-800/30 rounded-2xl p-6 mb-10 shadow-lg w-full"
        >
            <Users className="h-16 w-16 sm:h-12 sm:w-12 text-purple-400 flex-shrink-0"/>
            <div>
                <h2 className="text-xl font-bold text-white">Collaborate with Blend</h2>
                <p className="text-gray-400 mt-1">
                    Create a 'Blend' room to build shared playlists with friends in real-time and get recommendations based on your combined tastes.
                </p>
            </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.button
            onClick={() => router.push('/auth')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-bold rounded-full shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-800/30 transition-all duration-300"
          >
            Get Started <ArrowRight />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
