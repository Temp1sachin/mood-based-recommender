'use client';

// Imports for the new UI
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Music, Trash2 } from 'lucide-react';

const PlaylistCard = ({ playlist, onDelete, onSelect }) => {
  const handleDelete = (e) => {
    e.stopPropagation(); 
    onDelete();
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="group"
      onClick={onSelect}
    >
      <div className="bg-gray-900/50 border border-purple-800/30 rounded-lg overflow-hidden group hover:border-pink-500/70 transition-all duration-300 shadow-lg shadow-purple-900/10 cursor-pointer">
        <div className="relative aspect-square">
          <Image
            // 👇 THE FIX: Changed back to your original property name
            src={playlist.coverImage || '/images/placeholder.png'}
            alt={`Cover for ${playlist.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-gray-300 hover:bg-pink-600/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-0 left-0 p-3 w-full">
            <h3 className="font-bold text-lg text-white truncate">{playlist.name}</h3>
            <p className="text-sm text-purple-300 flex items-center gap-1.5 pt-1">
              <Music className="h-4 w-4" /> 
              {playlist.movies.length} {playlist.movies.length === 1 ? 'movie' : 'movies'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;