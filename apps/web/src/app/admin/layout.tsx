export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold tracking-tight text-blue-500">Admin Panel</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="/admin" className="block px-4 py-3 rounded-lg bg-blue-600/10 text-blue-400 font-medium">
              Dashboard
            </a>
            <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
              Users & KYC
            </a>
            <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
              Transactions
            </a>
            <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
              Audit Logs
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
