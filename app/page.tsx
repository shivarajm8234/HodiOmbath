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

import { rtdb } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showStoryboard, setShowStoryboard] = useState(true);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    const memoriesRef = ref(rtdb, 'memories');
    const unsubscribe = onValue(memoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array if needed
        const memoriesList = Object.values(data) as Memory[];
        setMemories(memoriesList);
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
    return <Storyboard onComplete={() => setShowStoryboard(false)} />;
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
        />

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
