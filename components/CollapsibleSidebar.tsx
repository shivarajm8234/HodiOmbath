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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-card border border-border shadow-2xl z-[4500] flex flex-col overflow-hidden rounded-2xl max-h-[85vh]"
              initial={{ opacity: 0, scale: 0.9, y: "-45%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, y: "-45%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <MapPin size={22} className="text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Memories</h2>
                    <p className="text-xs text-muted-foreground">{filteredMemories.length} found</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close sidebar"
                >
                  <X size={20} className="text-foreground" />
                </motion.button>
              </div>

              {/* Search and filters */}
              <div className="p-4 space-y-3 border-b border-border bg-background/50">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border-2 border-input text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                    aria-label="Search memories"
                  />
                </div>

                {/* Mood filter */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-2.5 block uppercase tracking-wide">
                    Mood Filter
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      onClick={() => setFilterMood(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wide ${
                        filterMood === null
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted/60 text-muted-foreground hover:bg-primary/20'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      All
                    </motion.button>
                    {moods.map((mood) => (
                      <motion.button
                        key={mood}
                        onClick={() => setFilterMood(mood)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                          filterMood === mood
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'bg-muted/60 text-muted-foreground hover:bg-primary/20'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {mood}
                      </motion.button>
                    ))}
                  </div>
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
                className="p-4 border-t border-border bg-gradient-to-t from-primary/5 to-transparent text-xs text-muted-foreground space-y-2.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total memories:</span>
                  <span className="font-bold text-foreground">{memories.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Countries:</span>
                  <span className="font-bold text-foreground">{new Set(memories.map(m => m.location?.country)).size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Avg rating:</span>
                  <span className="font-bold text-foreground">{'⭐'.repeat(Math.round(memories.reduce((sum, m) => sum + m.rating, 0) / memories.length))}</span>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
