'use client';

import { useState } from 'react';
import { Memory, MemoryCollection } from '@/lib/types';
import { Plus, X, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollectionManagerProps {
  collections: MemoryCollection[];
  selectedMemory: Memory | null;
  onAddToCollection: (memoryId: string, collectionId: string) => void;
  onCreateCollection: (collection: Omit<MemoryCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteCollection: (collectionId: string) => void;
}

export default function CollectionManager({
  collections,
  selectedMemory,
  onAddToCollection,
  onCreateCollection,
  onDeleteCollection,
}: CollectionManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
  });

  const handleCreateCollection = () => {
    if (!newCollection.name.trim()) return;

    onCreateCollection({
      name: newCollection.name,
      description: newCollection.description,
      memories: selectedMemory ? [selectedMemory.id] : [],
      coverImage: selectedMemory?.images?.[0],
    });

    setNewCollection({ name: '', description: '' });
    setShowCreateForm(false);
  };

  const handleAddToCollection = (collectionId: string) => {
    if (selectedMemory) {
      onAddToCollection(selectedMemory.id, collectionId);
    }
  };

  const toggleExpand = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  if (!selectedMemory) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
        <div className="text-5xl mb-4">📍</div>
        <p className="font-medium">Select a memory from the map</p>
        <p className="text-sm mt-1">to manage collections</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Selected Memory Info */}
      <div className="bg-primary/10 border-b border-border p-4 sticky top-0">
        <div className="flex gap-3 mb-3">
          {selectedMemory.images?.[0] && (
            <img
              src={selectedMemory.images[0]}
              alt={selectedMemory.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {selectedMemory.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedMemory.location?.city}, {selectedMemory.location?.country}
            </p>
          </div>
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 p-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground mb-3">Add to Collections</h4>

        <AnimatePresence>
          {collections.length > 0 ? (
            collections.map((collection, idx) => {
              const isInCollection = collection.memories.includes(selectedMemory.id);
              const isExpanded = expandedCollections.has(collection.id);

              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpand(collection.id)}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCollection(collection.id);
                      }}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isInCollection
                          ? 'bg-primary border-primary'
                          : 'border-input hover:border-primary'
                      }`}
                    >
                      {isInCollection && <Check size={16} className="text-primary-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm line-clamp-1">
                        {collection.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {collection.memories.length} {collection.memories.length === 1 ? 'memory' : 'memories'}
                      </p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-muted/30 p-3 space-y-2"
                      >
                        {collection.description && (
                          <p className="text-xs text-muted-foreground italic">
                            "{collection.description}"
                          </p>
                        )}
                        {collection.memories.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-1">Memories:</p>
                            <p className="ml-2">{collection.memories.length} items in this collection</p>
                          </div>
                        )}
                        <button
                          onClick={() => onDeleteCollection(collection.id)}
                          className="w-full text-xs px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          Delete Collection
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No collections yet</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create New Collection Button */}
      <div className="border-t border-border p-4 space-y-3">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus size={18} />
            New Collection
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <input
              type="text"
              placeholder="Collection name *"
              value={newCollection.name}
              onChange={(e) =>
                setNewCollection({ ...newCollection, name: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              placeholder="Description (optional)"
              value={newCollection.description}
              onChange={(e) =>
                setNewCollection({ ...newCollection, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateCollection}
                disabled={!newCollection.name.trim()}
                className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCollection({ name: '', description: '' });
                }}
                className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
