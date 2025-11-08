export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  pendingJobs: number;
  expiredJobs: number;
  avgProcessingTime: number;
}

export interface ImportStats {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  totalJobsFetched: number;
  totalJobsImported: number;
  successRate: number;
  avgImportDuration: number;
  lastImportDate: string;
}

export interface SystemStats {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  queueSize: number;
  errorRate: number;
}

export interface DashboardData {
  jobStats: JobStats;
  importStats: ImportStats;
  systemStats: SystemStats;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'job' | 'import' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface ImportLog {
  _id: string;
  source: string;
  status: string;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  duration: number;
  startedAt: string;
  endedAt: string;
}
