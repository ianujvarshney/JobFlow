'use client';

import { ImportLog } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface ImportHistoryTableProps {
  imports: ImportLog[];
  onViewDetails: (importLog: ImportLog) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'running':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSuccessRate = (log: ImportLog) => {
  if (log.totalFetched === 0) return 0;
  return Math.round((log.totalImported / log.totalFetched) * 100);
};

export default function ImportHistoryTable({ imports, onViewDetails }: ImportHistoryTableProps) {
  if (!imports || !Array.isArray(imports)) {
    return <div className="bg-white shadow rounded-lg p-4 text-gray-500">No import history available.</div>;
  }
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fetched</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imported</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {imports.map((importLog) => (
              <tr key={importLog._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{importLog.source}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(importLog.status)}`}>
                    {importLog.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{importLog.totalFetched}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{importLog.totalImported}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{importLog.newJobs}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{importLog.updatedJobs}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{importLog.failedJobs}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${getSuccessRate(importLog) >= 90 ? 'bg-green-600' : getSuccessRate(importLog) >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${getSuccessRate(importLog)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{getSuccessRate(importLog)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {importLog.duration ? `${Math.round(importLog.duration / 1000)}s` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(importLog.startedAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onViewDetails(importLog)} className="text-blue-600 hover:text-blue-900">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}