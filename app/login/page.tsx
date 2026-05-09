"use client";

import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X, Shield, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "An internal error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00a82d] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-white px-4 pt-20 pb-10 overflow-hidden font-sans text-[#2d2e2e]">
      {/* Decorative Shapes */}
      {/* Green Star Shape (Left) */}
      <div className="absolute top-20 -left-20 w-80 h-80 opacity-80 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#71d14e" d="M100 0 L120 70 L190 70 L135 115 L155 185 L100 140 L45 185 L65 115 L10 70 L80 70 Z" />
        </svg>
      </div>

      {/* Pink Cloud Shape (Right) */}
      <div className="absolute top-1/2 -right-20 w-80 h-80 opacity-60 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#fbb6ce" d="M44.7,-76.4C58.3,-69.2,70,-58.5,78.2,-45.5C86.4,-32.4,91.1,-16.2,90.4,-0.4C89.8,15.4,83.7,30.8,75.1,44.9C66.5,59,55.3,71.8,41.4,78.9C27.5,85.9,10.9,87.2,-4.3,94.7C-19.5,102.1,-33.4,115.8,-45.1,114.7C-56.9,113.6,-66.6,97.7,-74,83.1C-81.4,68.4,-86.5,55,-89.8,41.2C-93.1,27.5,-94.6,13.7,-91.9,0.7C-89.2,-12.3,-82.3,-24.6,-74.6,-36C-66.9,-47.4,-58.4,-57.8,-47.5,-66.9C-36.6,-76,-23.3,-83.8,-9.3,-84.3C4.7,-84.9,18.7,-78.2,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="z-10 w-full max-w-[400px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/icon.png" alt="Hodi Ombath" width={60} height={60} className="rounded-xl" />
        </div>

        <h1 className="text-4xl font-bold mb-2">Sign in</h1>
        <p className="text-sm text-gray-500 mb-12 text-center">to continue to your Hodi Ombath account.</p>

        {error && (
          <div className="w-full mb-6 flex items-center gap-3 rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="w-full space-y-6">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-4 w-full py-4 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-12 text-center text-sm space-y-4">
          <p className="text-gray-500">
            By continuing, you agree to our{" "}
            <button onClick={() => setModalType("terms")} className="text-blue-600 font-medium hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button onClick={() => setModalType("privacy")} className="text-blue-600 font-medium hover:underline">
              Privacy Policy
            </button>
          </p>
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button onClick={handleLogin} className="text-blue-600 font-medium hover:underline">Sign up</button>
          </p>
        </div>

        <div className="mt-20 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Hodi Ombath Corporation. All rights reserved.</p>
        </div>
      </div>

      {/* Pop-up Modals (Terms/Privacy) */}
      <AnimatePresence>
        {modalType && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-white rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {modalType === "terms" ? (
                    <FileText className="h-6 w-6 text-[#00a82d]" />
                  ) : (
                    <Shield className="h-6 w-6 text-[#00a82d]" />
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalType === "terms" ? "Terms of Service" : "Privacy Policy"}
                  </h2>
                </div>
                <button
                  onClick={() => setModalType(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="prose max-w-none text-gray-600 space-y-6">
                {modalType === "terms" ? (
                  <>
                    <p>Welcome to Hodi Ombath. By using our service, you agree to the following terms:</p>
                    <section>
                      <h3 className="text-xl font-semibold text-gray-900">1. User Conduct</h3>
                      <p>You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others.</p>
                    </section>
                  </>
                ) : (
                  <>
                    <p>Your privacy is important to us. This policy explains how we handle your data.</p>
                    <section>
                      <h3 className="text-xl font-semibold text-gray-900">1. Data Collection</h3>
                      <p>We collect information you provide directly to us, such as when you sign in with Google.</p>
                    </section>
                  </>
                )}
              </div>

              <div className="mt-12">
                <button
                  onClick={() => setModalType(null)}
                  className="w-full bg-[#00a82d] hover:bg-[#008f26] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#00a82d]/20"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
