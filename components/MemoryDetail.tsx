import { Memory } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Star, Heart, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { rtdb } from '@/lib/firebase';
import { ref, push, onValue, serverTimestamp, set } from 'firebase/database';
import { useState, useEffect } from 'react';

interface MemoryDetailProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemoryDetail({
  memory,
  isOpen,
  onClose,
}: MemoryDetailProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (isOpen && memory && user) {
      // Record View
      const viewRef = push(ref(rtdb, `views/${memory.id}`));
      set(viewRef, {
        uid: user.uid,
        email: user.email,
        timestamp: serverTimestamp(),
      });

      // Record detailed user activity
      const activityRef = push(ref(rtdb, `user_activity/${user.uid}`));
      set(activityRef, {
        type: 'view_memory',
        memoryId: memory.id,
        memoryTitle: memory.title,
        timestamp: serverTimestamp(),
      });

      // Listen for Likes
      const likesRef = ref(rtdb, `likes/${memory.id}`);
      const likesUnsub = onValue(likesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const likesCount = Object.keys(data).length;
          setLikes(likesCount);
          setHasLiked(Object.values(data).some((l: any) => l.uid === user.uid));
        } else {
          setLikes(0);
          setHasLiked(false);
        }
      });

      // Listen for Comments
      const commentsRef = ref(rtdb, `comments/${memory.id}`);
      const commentsUnsub = onValue(commentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setComments(Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp));
        } else {
          setComments([]);
        }
      });

      // Listen for total views (count)
      const totalViewsRef = ref(rtdb, `views/${memory.id}`);
      const viewsUnsub = onValue(totalViewsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setViews(Object.keys(data).length);
        else setViews(0);
      });

      return () => {
        likesUnsub();
        commentsUnsub();
        viewsUnsub();
      };
    }
  }, [isOpen, memory, user]);

  const handleLike = () => {
    if (!user || !memory || hasLiked) return;
    const likeRef = push(ref(rtdb, `likes/${memory.id}`));
    set(likeRef, { uid: user.uid, timestamp: serverTimestamp() });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !memory || !newComment.trim()) return;
    const commentRef = push(ref(rtdb, `comments/${memory.id}`));
    set(commentRef, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      text: newComment,
      timestamp: serverTimestamp(),
    });
    setNewComment('');
  };

  if (!memory) return null;

  const moodEmoji: Record<string, string> = {
    nostalgic: '🌅',
    joyful: '😄',
    peaceful: '🧘',
    adventurous: '🗻',
    reflective: '🌙',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[8000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 bg-background rounded-2xl shadow-2xl z-[8500] overflow-auto max-h-[90vh]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10"
            >
              <X size={24} className="text-foreground" />
            </button>

            {/* Image carousel */}
            {memory.images.length > 0 && (
              <div className="relative h-96 w-full bg-muted overflow-hidden">
                <img
                  src={memory.images[0]}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {memory.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span>
                      {memory.location.city || memory.location.state}
                      {memory.location.country && `, ${memory.location.country}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span>
                      {new Date(memory.travelDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                {memory.description}
              </p>

              {/* Tags */}
              {memory.tags && memory.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Image gallery */}
              {memory.images && memory.images.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {memory.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={img}
                          alt={`${memory.title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location details */}
              <div className="border-t border-border pt-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Location Details</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">{views} views</span>
                    <button 
                      onClick={handleLike}
                      className={`flex items-center gap-1 transition-colors ${hasLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                      <Heart size={12} fill={hasLiked ? "currentColor" : "none"} /> {likes} likes
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* ... existing location fields ... */}
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="text-foreground font-medium">{memory.location.country}</p>
                  </div>
                  {memory.location.state && (
                    <div>
                      <p className="text-muted-foreground">State</p>
                      <p className="text-foreground font-medium">{memory.location.state}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Section: Comments */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <MessageSquare size={20} className="text-primary" />
                  <h3 className="font-semibold text-lg">Comments</h3>
                </div>

                <form onSubmit={handleComment} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a thought about this place..."
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>

                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment, idx) => (
                      <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {comment.photoURL ? (
                            <img src={comment.photoURL} alt={comment.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary">{comment.displayName?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">{comment.displayName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 italic">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
