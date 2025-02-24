'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-32 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 w-48 mx-auto mt-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" suppressHydrationWarning>
      {/* Tema değiştirme butonu - admin login sayfasında gösterme */}
      {mounted && pathname !== '/admin/login' && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
      
      {/* Ana içerik */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 