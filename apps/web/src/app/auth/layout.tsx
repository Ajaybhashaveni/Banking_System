export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Dynamic background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>
      
      <div className="z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
