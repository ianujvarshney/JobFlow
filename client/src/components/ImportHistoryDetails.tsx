'use client';

import { ImportLog } from '@/lib/types';
import { format } from 'date-fns';

interface ImportHistoryDetailsProps {
  importLog: ImportLog;
  onClose: () => void;
}

export default function ImportHistoryDetails({ importLog, onClose }: ImportHistoryDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Import Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>ID:</strong> {importLog._id}</div>
          <div><strong>Source:</strong> {importLog.source}</div>
          <div><strong>Status:</strong> {importLog.status}</div>
          <div><strong>Started:</strong> {format(new Date(importLog.startedAt), 'PPP p')}</div>
          <div><strong>Ended:</strong> {importLog.endedAt ? format(new Date(importLog.endedAt), 'PPP p') : 'N/A'}</div>
          <div><strong>Duration:</strong> {importLog.duration ? `${(importLog.duration / 1000).toFixed(2)}s` : 'N/A'}</div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-4">
            <div><strong>Total Fetched:</strong> {importLog.totalFetched}</div>
            <div><strong>Total Imported:</strong> {importLog.totalImported}</div>
            <div><strong>New Jobs:</strong> {importLog.newJobs}</div>
            <div><strong>Updated Jobs:</strong> {importLog.updatedJobs}</div>
            <div><strong>Failed Jobs:</strong> {importLog.failedJobs}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}