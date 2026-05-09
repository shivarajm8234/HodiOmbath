import { Memory } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, MapPin, Star, AlertCircle } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function MemoryCard({
  memory,
  isSelected,
  onClick,
}: MemoryCardProps) {
  const moodEmoji: Record<string, string> = {
    nostalgic: '🌅',
    joyful: '😄',
    peaceful: '🧘',
    adventurous: '🗻',
    reflective: '🌙',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-primary shadow-lg scale-105'
          : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Image */}
        {memory.images && memory.images.length > 0 ? (
          <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
            <img
              src={memory.images[0]}
              alt={memory.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                console.log('[v0] Card image failed:', memory.images[0]);
              }}
            />
            <motion.div 
              className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-lg">{moodEmoji[memory.mood]}</span>
              <span className="text-xs font-bold capitalize">{memory.mood}</span>
            </motion.div>
          </div>
        ) : (
          <div className="h-40 w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-col gap-2">
            <AlertCircle size={32} className="text-gray-400" />
            <p className="text-xs text-gray-500">No image</p>
          </div>
        )}

        {/* Content */}
        <div className="p-3.5">
          <h3 className="font-bold text-sm text-card-foreground mb-1.5 line-clamp-2">
            {memory.title}
          </h3>

          <motion.div 
            className="flex items-center gap-1 text-xs text-muted-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MapPin size={13} className="flex-shrink-0" />
            <span className="font-medium">
              {memory.location.city || memory.location.state || memory.location.country}
            </span>
          </motion.div>

          <p className="text-xs text-card-foreground/80 line-clamp-2 mb-3">
            {memory.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2.5">
            <div className="flex items-center gap-1">
              <Calendar size={13} className="flex-shrink-0" />
              <span className="font-medium">{new Date(memory.travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1">
              {'⭐'.repeat(memory.rating)}
            </div>
          </div>

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <motion.div 
              className="mt-2.5 flex flex-wrap gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {memory.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {memory.tags.length > 2 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{memory.tags.length - 2}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
