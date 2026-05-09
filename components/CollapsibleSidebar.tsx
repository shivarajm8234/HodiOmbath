'use client';

import { useState, useEffect, useRef } from 'react';
import { Memory } from '@/lib/types';
import { Search, X, MapPin, ChevronRight } from 'lucide-react';
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
      // Cmd/Ctrl + K to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Escape to close sidebar
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

  // Reset filters when closing
  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
    setFilterMood(null);
  };

  // Select memory and keep sidebar open
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
        aria-label="Open memories sidebar"
        title="Open sidebar (Cmd+K)"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl flex items-center justify-center hover:shadow-2xl transition-all hover:from-primary/90 hover:to-secondary/90 border-2 border-white">
          <MapPin size={32} className="text-primary-foreground" />
        </div>
        {/* Tooltip */}
        <motion.div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
          initial={{ opacity: 0, y: 5 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          Cmd+K to open
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground transform rotate-45" />
        </motion.div>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[4000]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[4000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Centered Popup Modal */}
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-white border border-gray-200 shadow-2xl z-[6000] flex flex-col overflow-hidden rounded-3xl max-h-[85vh]"
              initial={{ opacity: 0, scale: 0.95, y: "-48%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: "-48%" }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Close button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                whileTap={{ scale: 0.95 }}
                aria-label="Close popup"
              >
                <X size={20} className="text-gray-400" />
              </motion.button>

              {/* Header (Login Style) */}
              <div className="pt-10 pb-6 flex flex-col items-center">
                <div className="mb-6">
                  <img src="/icon.png" alt="Logo" className="w-14 h-14 rounded-xl shadow-sm" />
                </div>
                <h2 className="text-3xl font-bold text-[#2d2e2e]">Memories</h2>
                <p className="text-sm text-gray-500 mt-1">Discover your travel stories</p>
              </div>

              {/* Search and filters */}
              <div className="px-6 pb-6 space-y-5">
                {/* Search */}
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#2d2e2e] placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-base transition-all"
                    aria-label="Search memories"
                  />
                </div>

                {/* Mood filter */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <motion.button
                    onClick={() => setFilterMood(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filterMood === null
                        ? 'bg-[#2d2e2e] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    All
                  </motion.button>
                  {moods.map((mood) => (
                    <motion.button
                      key={mood}
                      onClick={() => setFilterMood(mood)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                        filterMood === mood
                          ? 'bg-[#2d2e2e] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {mood}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Memory list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {filteredMemories.length > 0 ? (
                  filteredMemories.map((memory, idx) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 10 }}
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
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <MapPin size={36} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">No memories found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats footer */}
              <motion.div 
                className="p-6 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 space-y-2.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total memories:</span>
                  <span className="font-bold text-[#2d2e2e]">{memories.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Countries:</span>
                  <span className="font-bold text-[#2d2e2e]">{new Set(memories.map(m => m.location?.country)).size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Avg rating:</span>
                  <span className="font-bold text-[#2d2e2e]">{'⭐'.repeat(Math.round(memories.reduce((sum, m) => sum + m.rating, 0) / memories.length))}</span>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
