'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import MemoryDetail from '@/components/MemoryDetail';
import { Memory } from '@/lib/types';
import { mockMemories } from '@/lib/mockData';

// Dynamically import map to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Storyboard from '@/components/Storyboard';
import MemoryForm from '@/components/MemoryForm';

import { rtdb } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ type: 'success' | 'error' | 'loading', msg: string } | null>(null);

  useEffect(() => {
    // Show storyboard ONLY if we just logged in
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn) {
      setShowStoryboard(true);
      sessionStorage.removeItem('justLoggedIn');
    }
  }, []);

  const handleStoryboardComplete = () => {
    setShowStoryboard(false);
  };

  useEffect(() => {
    const memoriesRef = ref(rtdb, 'memories');
    const unsubscribe = onValue(memoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array if needed
        const memoriesList = Object.values(data) as Memory[];
        // Filter approved memories for the main map
        setMemories(memoriesList.filter(m => m.status === 'approved'));
      } else {
        setMemories([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  if (showStoryboard) {
    return <Storyboard onComplete={handleStoryboardComplete} />;
  }

  return (
    <>
      <Navigation />
      <div className="h-[calc(100vh-64px)] bg-background relative overflow-hidden">
        {/* Interactive Map */}
        <InteractiveMap
          memories={memories}
          onMemoryClick={setSelectedMemory}
          selectedMemoryId={selectedMemory?.id}
        />

        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          memories={memories}
          onMemorySelect={setSelectedMemory}
          selectedMemory={selectedMemory}
          onAddClick={() => setShowForm(true)}
        />

        {/* Memory detail modal */}
        <MemoryDetail
          memory={selectedMemory}
          isOpen={selectedMemory !== null}
          onClose={() => setSelectedMemory(null)}
        />

        {/* Create Memory Form */}
        <AnimatePresence>
          {showForm && (
            <MemoryForm
              onCancel={() => setShowForm(false)}
              onSubmit={async (memory) => {
                setDbStatus({ type: 'loading', msg: 'Submitting memory...' });
                try {
                  await set(ref(rtdb, `memories/${memory.id}`), memory);
                  setDbStatus({ type: 'success', msg: 'Submitted for approval!' });
                  setShowForm(false);
                  setTimeout(() => setDbStatus(null), 3000);
                } catch (error: any) {
                  setDbStatus({ type: 'error', msg: `Submission failed: ${error.message}` });
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Status Toast */}
        <AnimatePresence>
          {dbStatus && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 right-8 z-[10000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20"
              style={{ 
                backgroundColor: dbStatus.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                                 dbStatus.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                                 'rgba(59, 130, 246, 0.9)' 
              }}
            >
              <div className="text-white font-bold">{dbStatus.msg}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
