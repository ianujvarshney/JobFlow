'use client';

import { DashboardData } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  data: DashboardData;
}

function StatCard({ title, value, subtitle, trend, icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  icon: string;
  color: string;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-md p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/40`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl">{icon}</div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className={`mr-1 ${
                trend.isPositive ? '↗️' : '↘️'
              }`}></span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 text-sm font-medium">{label}</span>
        <span className="text-gray-500 text-sm">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const statusColors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const typeIcons = {
    job: '💼',
    import: '📥',
    system: '⚙️',
  };

  return (
    <div className="group flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 border border-gray-200">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg border`}>
      
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-gray-800 font-medium">{activity.title}</p>
          <p className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </p>
        </div>
        <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ data }: DashboardProps) {
  const jobStats = [
    { title: 'Total Jobs', value: (data.jobStats.totalJobs || 0).toLocaleString(), icon: '📊', color: 'from-blue-400 to-blue-300' },
    { title: 'Active Jobs', value: (data.jobStats.activeJobs || 0).toLocaleString(), icon: '⚡', color: 'from-green-400 to-green-300' },
    { title: 'Completed', value: (data.jobStats.completedJobs || 0).toLocaleString(), icon: '✅', color: 'from-purple-400 to-purple-300' },
    { title: 'Pending', value: (data.jobStats.pendingJobs || 0).toLocaleString(), icon: '⏳', color: 'from-yellow-400 to-yellow-300' },
  ];

  const importStats = [
    { 
      title: 'Success Rate', 
      value: `${data.importStats.successRate || 0}%`, 
      subtitle: `${data.importStats.successfulImports || 0}/${data.importStats.totalImports || 0} imports`,
      trend: { value: 5.2, isPositive: true },
      icon: '🎯', 
      color: 'from-green-400 to-green-300' 
    },
    { 
      title: 'Jobs Imported', 
      value: (data.importStats.totalJobsImported || 0).toLocaleString(), 
      subtitle: `From ${(data.importStats.totalJobsFetched || 0).toLocaleString()} fetched`,
      icon: '📥', 
      color: 'from-blue-400 to-blue-300' 
    },
    { 
      title: 'Avg Duration', 
      value: `${data.importStats.avgImportDuration || 0}s`, 
      subtitle: 'Per import session',
      trend: { value: -12.5, isPositive: true },
      icon: '⏱️', 
      color: 'from-purple-400 to-purple-300' 
    },
    { 
      title: 'Failed Imports', 
      value: (data.importStats.failedImports || 0).toString(), 
      subtitle: 'Requires attention',
      trend: { value: -8.3, isPositive: true },
      icon: '❌', 
      color: 'from-red-400 to-red-300' 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {jobStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Import Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {importStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Performance */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/40">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">💻</span>
            System Performance
          </h3>
          <div className="space-y-4">
            <ProgressBar label="Memory Usage" value={data.systemStats?.memoryUsage || 0} max={100} color="from-blue-400 to-blue-300" />
            <ProgressBar label="CPU Usage" value={data.systemStats?.cpuUsage || 0} max={100} color="from-green-400 to-green-300" />
            <ProgressBar label="Error Rate" value={data.systemStats?.errorRate || 0} max={10} color="from-red-400 to-red-300" />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Uptime</p>
                <p className="text-gray-800 font-bold text-lg">{Math.floor((data.systemStats?.uptime || 0) / 3600)}h</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Connections</p>
                <p className="text-gray-800 font-bold text-lg">{data.systemStats?.activeConnections || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/40">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">🔔</span>
            Recent Activities
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {(data.recentActivities || []).map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-center text-purple-600 hover:text-purple-700 transition-colors duration-200 text-sm font-medium">
              View All Activities →
            </button>
          </div>
        </div>
      </div>

      {/* Job Processing Chart Placeholder */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">📈</span>
          Job Processing Trends
        </h3>
        <div className="h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-white/10">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-white/60">Interactive charts coming soon</p>
            <p className="text-white/40 text-sm mt-2">Real-time job processing visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
}