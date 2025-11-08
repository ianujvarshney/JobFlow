'use client';

import ImportHistory from '@/components/ImportHistory';

export default function ImportHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <ImportHistory />
      </main>
    </div>
  );
}