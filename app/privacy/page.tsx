import Navigation from "@/components/Navigation";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-400">
          <p>Your privacy is important to us. This policy explains how we handle your data.</p>
          <section>
            <h2 className="text-2xl font-semibold text-white">1. Data Collection</h2>
            <p>We collect information you provide directly to us, such as when you sign in with Google.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white">2. Usage Tracking</h2>
            <p>We record interactions such as viewed places, likes, and comments to improve your experience.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white">3. Data Sharing</h2>
            <p>We do not share your personal data with third parties except as required by law.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
