import Navigation from "@/components/Navigation";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-400">
          <p>Welcome to Hodi Ombath. By using our service, you agree to the following terms:</p>
          <section>
            <h2 className="text-2xl font-semibold text-white">1. User Conduct</h2>
            <p>You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white">2. Content</h2>
            <p>Users are responsible for the content they post. We reserve the right to remove any content that violates our policies.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white">3. Admin Access</h2>
            <p>Administrative access is restricted to authorized personnel only.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
