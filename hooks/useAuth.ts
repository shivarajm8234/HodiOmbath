"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider, rtdb } from "@/lib/firebase";
import { ref, push, serverTimestamp } from "firebase/database";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Update persistent user profile
        const profileRef = ref(rtdb, `profiles/${user.uid}`);
        set(profileRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastSeen: serverTimestamp(),
        });

        // Log login session
        const loginLogRef = ref(rtdb, 'access_logs');
        push(loginLogRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          timestamp: serverTimestamp(),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login successful:", result.user.email);
    } catch (error: any) {
      console.error("Login failed full error:", error);
      // Check for specific common issues
      if (error.code === 'auth/internal-error') {
        console.error("Internal error. Check if Google Auth is enabled in Firebase Console.");
      } else if (error.message.includes('Failed to fetch')) {
        console.error("Network error: Failed to fetch. Check your internet connection or firewall.");
      }
      throw error; // Re-throw to be handled by the UI
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { user, loading, loginWithGoogle, logout };
}
