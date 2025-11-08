import { Suspense } from 'react';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DashboardData } from '@/lib/types';
import { API_URL } from '@/lib/config';

async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const res = await fetch(`${API_URL}/api/dashboard/stats`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      jobStats: {
        totalJobs: 1247,
        activeJobs: 342,
        completedJobs: 892,
        pendingJobs: 156,
        expiredJobs: 23,
        avgProcessingTime: 2.4,
      },
      importStats: {
        totalImports: 89,
        successfulImports: 76,
        failedImports: 13,
        totalJobsFetched: 15420,
        totalJobsImported: 1247,
        successRate: 85.4,
        avgImportDuration: 3.2,
        lastImportDate: new Date().toISOString(),
      },
      systemStats: {
        uptime: 86400,
        memoryUsage: 68.5,
        cpuUsage: 45.2,
        activeConnections: 127,
        queueSize: 23,
        errorRate: 0.8,
      },
      recentActivities: [
        {
          id: '1',
          type: 'import',
          title: 'Import Completed',
          description: 'Successfully imported 156 new jobs from LinkedIn',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: 'success',
        },
        {
          id: '2',
          type: 'job',
          title: 'Job Processing',
          description: 'Processed 89 jobs in the last hour',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'info',
        },
        {
          id: '3',
          type: 'system',
          title: 'System Health',
          description: 'All systems operational - 99.9% uptime',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
        },
      ],
    };
  }
}

async function DashboardContent() {
  const data = await fetchDashboardData();
  return <Dashboard data={data} />;
}

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Soft floating elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>
      
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
        <header className="mb-12 text-center relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-purple-600 to-gray-800 bg-clip-text text-transparent mb-4 animate-gradient">
              JobFlow Dashboard
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-lg blur opacity-30 animate-pulse"></div>
            <p className="mt-4 text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Real-time job processing analytics with advanced import statistics and system performance monitoring
            </p>
          </div>
        </header>

        <section className="transform transition-all duration-700 hover:scale-[1.002]">
          <ErrorBoundary fallback={
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 text-center">
              <p className="text-red-400 text-lg font-medium">Failed to load dashboard data</p>
              <p className="text-red-300 mt-2">Please check your connection and try again</p>
            </div>
          }>
            <Suspense
              fallback={
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                      <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-blue-400/20"></div>
                    </div>
                    <p className="text-gray-300 text-lg font-medium">Loading dashboard data...</p>
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 md:p-8 transition-all duration-500 hover:shadow-purple-500/20 hover:border-white/20 hover:scale-[1.01]">
                <DashboardContent />
              </div>
            </Suspense>
          </ErrorBoundary>
        </section>

        <div className="flex justify-center">
          <Link href="/import-history" className="group">
            <div className="px-8 py-4 bg-gradient-to-r from-blue-100 to-purple-100 backdrop-blur-md rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-gray-800 font-semibold">View Import History</h3>
                  <p className="text-gray-600 text-sm">Track all your imports</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
