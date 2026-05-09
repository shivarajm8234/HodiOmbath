'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CollectionManager from '@/components/CollectionManager';
import { Memory, MemoryCollection } from '@/lib/types';
import { mockMemories, mockCollections } from '@/lib/mockData';
import MemoryForm from '@/components/MemoryForm';
import { Plus, Edit2, Trash2, Eye, EyeOff, MapPin, Map, Shield, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Dynamically import map to avoid SSR issues
const AdminMapView = dynamic(() => import('@/components/AdminMapView'), { ssr: false });

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [collections, setCollections] = useState<MemoryCollection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [selectedMapMemory, setSelectedMapMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapView, setShowMapView] = useState(false);
  const [activeTab, setActiveTab] = useState<'memories' | 'users'>('memories');
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [visibilityToggle, setVisibilityToggle] = useState<Set<string>>(new Set());
  const [dbStatus, setDbStatus] = useState<{ type: 'success' | 'error' | 'loading', msg: string } | null>(null);

  // Fetch Memories
  useEffect(() => {
    const memoriesRef = ref(rtdb, 'memories');
    const unsubscribe = onValue(memoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data) as Memory[];
        setMemories(list);
        setVisibilityToggle(new Set(list.map(m => m.id)));
      } else {
        setMemories(mockMemories);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Collections
  useEffect(() => {
    const collectionsRef = ref(rtdb, 'collections');
    const unsubscribe = onValue(collectionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCollections(Object.values(data) as MemoryCollection[]);
      } else {
        setCollections(mockCollections);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Profiles & Logs
  useEffect(() => {
    if (user && user.email === 'shivarajmani2005@gmail.com') {
      const profilesRef = ref(rtdb, 'profiles');
      const profilesUnsub = onValue(profilesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setUserProfiles(Object.values(data));
      });

      const logsRef = ref(rtdb, 'access_logs');
      const logsUnsub = onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logs = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
          setUserLogs(logs);
        }
      });

      return () => {
        profilesUnsub();
        logsUnsub();
      };
    }
  }, [user]);

  // Auth Protection
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.email !== 'shivarajmani2005@gmail.com') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const filteredMemories = memories.filter(
    (memory) =>
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.location.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMemory = async (memory: Memory) => {
    setDbStatus({ type: 'loading', msg: 'Creating memory...' });
    try {
      await set(ref(rtdb, `memories/${memory.id}`), memory);
      setDbStatus({ type: 'success', msg: 'Memory stored successfully!' });
      setShowForm(false);
      setTimeout(() => setDbStatus(null), 3000);
    } catch (error: any) {
      console.error("Store error:", error);
      setDbStatus({ type: 'error', msg: `Failed to store: ${error.message}` });
    }
  };

  const handleUpdateMemory = async (memory: Memory) => {
    setDbStatus({ type: 'loading', msg: 'Updating memory...' });
    try {
      await set(ref(rtdb, `memories/${memory.id}`), memory);
      setDbStatus({ type: 'success', msg: 'Memory updated successfully!' });
      setEditingMemory(null);
      setShowForm(false);
      setTimeout(() => setDbStatus(null), 3000);
    } catch (error: any) {
      setDbStatus({ type: 'error', msg: `Update failed: ${error.message}` });
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      setDbStatus({ type: 'loading', msg: 'Deleting...' });
      try {
        await remove(ref(rtdb, `memories/${id}`));
        setDbStatus({ type: 'success', msg: 'Memory deleted!' });
        setTimeout(() => setDbStatus(null), 3000);
      } catch (error: any) {
        setDbStatus({ type: 'error', msg: `Delete failed: ${error.message}` });
      }
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const isVisible = visibilityToggle.has(id);
    const newVisibility = new Set(visibilityToggle);
    if (isVisible) newVisibility.delete(id);
    else newVisibility.add(id);
    setVisibilityToggle(newVisibility);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <RotateCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.email !== 'shivarajmani2005@gmail.com') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 bg-card rounded-2xl border border-border shadow-xl">
            <Shield size={40} className="text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <button onClick={() => router.push('/')} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold">Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Navigation />
      
      {/* Admin Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md z-20 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Control</h1>
            <p className="text-sm text-muted-foreground">Manage Realtime Data</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-muted p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('memories')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'memories' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                Data
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                Users
              </button>
            </div>
            
            <button
              onClick={() => setShowMapView(!showMapView)}
              className={`p-2 rounded-lg border transition-all ${showMapView ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground'}`}
            >
              <Map size={20} />
            </button>
            
            <button
              onClick={() => { setEditingMemory(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6 relative">
        <AnimatePresence>
          {dbStatus && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/10"
              style={{ 
                backgroundColor: dbStatus.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                               dbStatus.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                               'rgba(59, 130, 246, 0.9)',
                color: 'white'
              }}
            >
              {dbStatus.type === 'loading' ? <RotateCw className="animate-spin" size={18} /> : 
               dbStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="font-semibold text-sm tracking-tight">{dbStatus.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto h-full">
          {showMapView ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
              <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-border shadow-2xl bg-card relative">
                <AdminMapView memories={memories} onMemorySelect={setSelectedMapMemory} />
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl flex flex-col">
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
            <div className="space-y-6">
              {activeTab === 'memories' ? (
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Memory Inventory</h2>
                    <input
                      type="text"
                      placeholder="Filter by title or country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary outline-none transition-all w-full md:w-64"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                          <th className="px-6 py-4 text-left">Memory</th>
                          <th className="px-6 py-4 text-left">Location</th>
                          <th className="px-6 py-4 text-left">Date</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredMemories.map((m) => (
                          <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <img src={m.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm ring-1 ring-border" />
                                <span className="font-bold text-foreground">{m.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground font-medium">{m.location.city}, {m.location.country}</td>
                            <td className="px-6 py-4 text-muted-foreground">{new Date(m.travelDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => { setEditingMemory(m); setShowForm(true); }} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteMemory(m.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Registered Community</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                          <th className="px-6 py-4 text-left">User</th>
                          <th className="px-6 py-4 text-left">Email</th>
                          <th className="px-6 py-4 text-left">Last Active</th>
                          <th className="px-6 py-4 text-left">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {userProfiles.map((p, idx) => (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={p.photoURL} alt="" className="w-8 h-8 rounded-full ring-1 ring-border" />
                                <span className="font-bold text-foreground">{p.displayName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{p.email}</td>
                            <td className="px-6 py-4 text-muted-foreground font-medium">{p.lastSeen ? new Date(p.lastSeen).toLocaleString() : 'Never'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${p.email === 'shivarajmani2005@gmail.com' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-500'}`}>
                                {p.email === 'shivarajmani2005@gmail.com' ? 'Admin' : 'User'}
                              </span>
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
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <MemoryForm
            initialMemory={editingMemory || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
