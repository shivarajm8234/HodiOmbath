'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Memory } from '@/lib/types';
import MemoryDetail from '@/components/MemoryDetail';
import { Search, Grid3x3, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { rtdb } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function ExplorePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'collections'>('all');
  const [filterMood, setFilterMood] = useState<string | null>(null);

  useEffect(() => {
    const memoriesRef = ref(rtdb, 'memories');
    const unsubscribe = onValue(memoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMemories(Object.values(data) as Memory[]);
      } else {
        setMemories([]);
      }
    });

    const collectionsRef = ref(rtdb, 'collections');
    const collectionsUnsub = onValue(collectionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCollections(Object.values(data));
      } else {
        setCollections([]);
      }
    });

    return () => {
      unsubscribe();
      collectionsUnsub();
    };
  }, []);

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      searchQuery === '' ||
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.location.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMood = filterMood === null || memory.mood === filterMood;

    return matchesSearch && matchesMood;
  });

  const moods = ['nostalgic', 'joyful', 'peaceful', 'adventurous', 'reflective'];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Explore Memories
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover travel stories and adventures from around the world
            </p>
          </div>

          {/* Search and filters */}
          <div className="space-y-6">
            {/* Search bar */}
            <div className="relative max-w-md mx-auto">
              <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search memories, places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Mood filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setFilterMood(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterMood === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/20'
                }`}
              >
                All Moods
              </button>
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setFilterMood(mood)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    filterMood === mood
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/20'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs and view toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Memories ({filteredMemories.length})
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'collections'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Collections ({collections.length})
            </button>
          </div>

          {/* View toggle */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Memories section */}
        {activeTab === 'all' ? (
          <>
            {filteredMemories.length > 0 ? (
              <motion.div
                layout
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredMemories.map((memory, idx) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    layoutId={memory.id}
                    onClick={() => setSelectedMemory(memory)}
                  >
                    {viewMode === 'grid' ? (
                      <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
                        {/* Image */}
                        {memory.images && memory.images.length > 0 && (
                          <div className="relative h-48 w-full overflow-hidden bg-muted">
                            <img
                              src={memory.images[0]}
                              alt={memory.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                              {memory.mood}
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
                            {memory.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {memory.location.city || memory.location.state}, {memory.location.country}
                          </p>
                          <p className="text-sm text-foreground line-clamp-2 mb-3">
                            {memory.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {'★'.repeat(Math.floor(memory.rating)).padEnd(5, '☆')}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(memory.travelDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-card rounded-lg border border-border p-4 hover:border-primary hover:shadow-lg transition-all cursor-pointer flex gap-4">
                        {memory.images && memory.images.length > 0 && (
                          <img
                            src={memory.images[0]}
                            alt={memory.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {memory.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {memory.location.city || memory.location.state}, {memory.location.country} • {new Date(memory.travelDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-foreground line-clamp-1 mb-2">
                            {memory.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 text-sm">
                              {'★'.repeat(Math.floor(memory.rating)).padEnd(5, '☆')}
                            </div>
                            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded capitalize">
                              {memory.mood}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No memories found matching your search
                </p>
              </div>
            )}
          </>
        ) : (
          /* Collections section */
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, idx) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Cover image */}
                {collection.coverImage && (
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <img
                      src={collection.coverImage}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                  <p className="text-sm text-accent font-medium">
                    {collection.memories.length} memories
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Memory detail modal */}
      <MemoryDetail
        memory={selectedMemory}
        isOpen={selectedMemory !== null}
        onClose={() => setSelectedMemory(null)}
      />
      </div>
    </>
  );
}
