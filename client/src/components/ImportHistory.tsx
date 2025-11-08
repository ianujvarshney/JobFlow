'use client';

import { useState } from 'react';
import { useRealtimeImports } from '@/lib/hooks/useRealtimeImports';
import { ImportLog } from '@/lib/types';
import { API_URL } from '@/lib/config';
import ImportHistoryTable from './ImportHistoryTable';
import ImportHistoryDetails from './ImportHistoryDetails';

export default function ImportHistory() {
  const { imports, loading, error } = useRealtimeImports(API_URL);
  const [selectedImport, setSelectedImport] = useState<ImportLog | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Import History (Real-time)</h2>
      <ImportHistoryTable imports={imports} onViewDetails={setSelectedImport} />
      {selectedImport && (
        <ImportHistoryDetails
          importLog={selectedImport}
          onClose={() => setSelectedImport(null)}
        />
      )}
    </div>
  );
}