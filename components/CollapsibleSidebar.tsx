'use client';

import { useState, useEffect, useRef } from 'react';
import { Memory } from '@/lib/types';
import { Search, X, MapPin, ChevronRight, BarChart3, Globe2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MemoryCard from './MemoryCard';

interface CollapsibleSidebarProps {
  memories: Memory[];
  onMemorySelect: (memory: Memory | null) => void;
  selectedMemory: Memory | null;
}

export default function CollapsibleSidebar({
  memories,
  onMemorySelect,
  selectedMemory,
}: CollapsibleSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const moods = ['nostalgic', 'joyful', 'peaceful', 'adventurous', 'reflective'];

  // Filter memories based on search and mood
  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      searchQuery === '' ||
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.location.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMood = filterMood === null || memory.mood === filterMood;

    return matchesSearch && matchesMood;
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input when sidebar opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
    setFilterMood(null);
  };

  const handleSelectMemory = (memory: Memory) => {
    onMemorySelect(memory);
  };

  return (
    <>
      {/* Floating Ball Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        disabled={isOpen}
        className="fixed bottom-8 left-8 z-[5000] disabled:opacity-0 group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open memories"
      >
        <div className="w-16 h-16 rounded-full bg-[#00a82d] shadow-xl flex items-center justify-center hover:shadow-2xl transition-all border-2 border-white">
          <MapPin size={32} className="text-white" />
        </div>
      </motion.button>

      {/* Modal Popup */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Modal Container */}
            <motion.div
              className="relative w-full max-w-xl bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden rounded-[32px] max-h-[85vh] md:max-h-[80vh]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              {/* Header */}
              <div className="pt-12 pb-6 flex flex-col items-center border-b border-gray-50">
                <div className="mb-4">
                  <img src="/icon.png" alt="Logo" className="w-16 h-16 rounded-2xl shadow-md" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#2d2e2e] tracking-tight">Travel Memories</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Revisiting your favorite journeys</p>
              </div>

              {/* Search and filters */}
              <div className="px-8 py-6 space-y-6 bg-gray-50/30">
                <div className="relative group">
                  <Search size={20} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#00a82d] transition-colors pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search your stories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-[#2d2e2e] placeholder:text-gray-400 focus:outline-none focus:border-[#00a82d] focus:ring-4 focus:ring-[#00a82d]/5 text-base transition-all shadow-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setFilterMood(null)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      filterMood === null
                        ? 'bg-[#00a82d] text-white shadow-lg shadow-[#00a82d]/20'
                        : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setFilterMood(mood)}
                      className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider capitalize transition-all ${
                        filterMood === mood
                          ? 'bg-[#00a82d] text-white shadow-lg shadow-[#00a82d]/20'
                          : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory list */}
              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 custom-scrollbar">
                {filteredMemories.length > 0 ? (
                  filteredMemories.map((memory, idx) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectMemory(memory)}
                      className="cursor-pointer"
                    >
                      <MemoryCard
                        memory={memory}
                        isSelected={selectedMemory?.id === memory.id}
                        onClick={() => handleSelectMemory(memory)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <Globe2 size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-semibold">No stories found</p>
                    <p className="text-sm">Try a different mood or search term</p>
                  </div>
                )}
              </div>

              {/* Stats footer */}
              <div className="p-8 border-t border-gray-100 bg-white">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-2xl bg-gray-50">
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                      <BarChart3 size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Total</span>
                    </div>
                    <span className="text-xl font-bold text-[#2d2e2e]">{memories.length}</span>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-gray-50">
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                      <Globe2 size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Globes</span>
                    </div>
                    <span className="text-xl font-bold text-[#2d2e2e]">{new Set(memories.map(m => m.location?.country)).size}</span>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-gray-50">
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                      <Star size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Rating</span>
                    </div>
                    <span className="text-xl font-bold text-[#2d2e2e]">
                      {(memories.reduce((sum, m) => sum + m.rating, 0) / memories.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </>
  );
}
