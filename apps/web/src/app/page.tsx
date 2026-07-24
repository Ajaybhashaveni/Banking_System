import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="glass-card p-12 rounded-3xl max-w-3xl w-full z-10 relative">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Welcome to <span className="text-gradient">NextGen</span> Banking
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Experience the future of finance with our secure, lightning-fast digital platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/register" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transform hover:-translate-y-1 w-full sm:w-auto">
            Open an Account
          </Link>
          <Link href="/auth/login" className="px-8 py-4 rounded-xl glass hover:bg-white/10 text-white font-semibold transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
