'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import CollectionManager from '@/components/CollectionManager';
import { Memory, MemoryCollection } from '@/lib/types';
import { mockMemories, mockCollections } from '@/lib/mockData';
import MemoryForm from '@/components/MemoryForm';
import { Plus, Edit2, Trash2, Eye, EyeOff, MapPin, Map, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { rtdb } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Dynamically import map to avoid SSR issues
const AdminMapView = dynamic(() => import('@/components/AdminMapView'), { ssr: false });

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.email !== 'shivarajmani2005@gmail.com') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const [memories, setMemories] = useState<Memory[]>(mockMemories);
  const [collections, setCollections] = useState<MemoryCollection[]>(mockCollections);
  const [showForm, setShowForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [selectedMapMemory, setSelectedMapMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapView, setShowMapView] = useState(false);
  const [activeTab, setActiveTab] = useState<'memories' | 'users'>('memories');
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [visibilityToggle, setVisibilityToggle] = useState<Set<string>>(
    new Set(memories.map((m) => m.id))
  );

  useEffect(() => {
    if (user && user.email === 'shivarajmani2005@gmail.com') {
      const logsRef = ref(rtdb, 'access_logs');
      onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logs = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
          setUserLogs(logs);
        }
      });
    }
  }, [user]);

  const filteredMemories = memories.filter(
    (memory) =>
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.location.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMemory = (memory: Memory) => {
    setMemories([...memories, memory]);
    setShowForm(false);
  };

  const handleUpdateMemory = (memory: Memory) => {
    setMemories(memories.map((m) => (m.id === memory.id ? memory : m)));
    setEditingMemory(null);
    setShowForm(false);
  };

  const handleDeleteMemory = (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      setMemories(memories.filter((m) => m.id !== id));
    }
  };

  const handleToggleVisibility = (id: string) => {
    const newVisibility = new Set(visibilityToggle);
    if (newVisibility.has(id)) {
      newVisibility.delete(id);
    } else {
      newVisibility.add(id);
    }
    setVisibilityToggle(newVisibility);
  };

  const handleFormSubmit = (memory: Memory) => {
    if (editingMemory) {
      handleUpdateMemory(memory);
    } else {
      handleCreateMemory(memory);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMemory(null);
  };

  const handleAddToCollection = (memoryId: string, collectionId: string) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === collectionId) {
          const memories = col.memories.includes(memoryId)
            ? col.memories.filter((id) => id !== memoryId)
            : [...col.memories, memoryId];
          return { ...col, memories, updatedAt: new Date().toISOString() };
        }
        return col;
      })
    );
  };

  const handleCreateCollection = (collection: Omit<MemoryCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCollection: MemoryCollection = {
      ...collection,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCollections([...collections, newCollection]);
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (confirm('Delete this collection?')) {
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.email !== 'shivarajmani2005@gmail.com') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 bg-card rounded-2xl border border-border shadow-xl">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Shield size={40} className="text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
              <p className="text-muted-foreground text-sm">
                You do not have the required permissions to access the Admin Dashboard. 
                Please contact the administrator if you believe this is an error.
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your travel memories and collections
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('memories')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'memories' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Memories
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'users' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Users
              </button>
              <div className="w-px h-6 bg-border mx-2" />
              <button
                onClick={() => setShowMapView(!showMapView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showMapView
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                <Map size={18} />
                Map View
              </button>
              <button
                onClick={() => {
                  setEditingMemory(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                New Memory
              </button>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg bg-card border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        {showMapView ? (
          // Map View with Collection Manager
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 min-h-[600px]">
            <div className="lg:col-span-2 h-[500px] lg:h-full rounded-xl overflow-hidden border border-border shadow-inner bg-card">
              <AdminMapView 
                memories={memories}
                onMemorySelect={setSelectedMapMemory}
              />
            </div>
            <div className="bg-card rounded-xl border border-border flex flex-col shadow-sm overflow-hidden h-[500px] lg:h-full">
              <CollectionManager
                collections={collections}
                selectedMemory={selectedMapMemory}
                onAddToCollection={handleAddToCollection}
                onCreateCollection={handleCreateCollection}
                onDeleteCollection={handleDeleteCollection}
              />
            </div>
          </div>
        ) : (
          // Table View
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
            {activeTab === 'memories' ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Total Memories</p>
                    <p className="text-3xl font-bold text-foreground">{memories.length}</p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Countries Visited</p>
                    <p className="text-3xl font-bold text-foreground">
                      {new Set(memories.map((m) => m.location.country)).size}
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                    <p className="text-3xl font-bold text-foreground">
                      {(memories.reduce((sum, m) => sum + m.rating, 0) / memories.length).toFixed(1)}/5
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Collections</p>
                    <p className="text-3xl font-bold text-foreground">{collections.length}</p>
                  </div>
                </div>

                {/* Memories Table */}
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Public</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredMemories.map((memory, idx) => (
                          <tr key={memory.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {memory.images.length > 0 && (
                                  <img src={memory.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                )}
                                <span className="font-medium text-foreground">{memory.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {memory.location.city}, {memory.location.country}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(memory.travelDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleToggleVisibility(memory.id)} className="p-2 hover:bg-muted rounded-lg">
                                {visibilityToggle.has(memory.id) ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} />}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingMemory(memory); setShowForm(true); }} className="p-2 hover:bg-muted rounded-lg"><Edit2 size={16} className="text-primary" /></button>
                                <button onClick={() => handleDeleteMemory(memory.id)} className="p-2 hover:bg-muted rounded-lg"><Trash2 size={16} className="text-destructive" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">User Access Logs</h2>
                  <p className="text-sm text-muted-foreground">Real-time tracking of users accessing the system</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Last Seen</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {userLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img src={log.photoURL} alt="" className="w-8 h-8 rounded-full" />
                              <span className="font-medium text-foreground">{log.displayName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{log.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-500 uppercase">Online</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Memory Form Modal */}
      {showForm && (
        <MemoryForm
          initialMemory={editingMemory || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
      </div>
    </>
  );
}
