const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ImportLog {
  _id: string;
  source: string;
  feedUrl: string;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failedJobsDetails: Array<{
    jobTitle: string;
    error: string;
  }>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

interface QueueStatus {
  jobImportQueue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  jobProcessQueue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
}

interface ImportStats {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  totalJobsImported: number;
  averageImportTime: number;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  category: string;
  salary?: string;
  url: string;
  externalId: string;
  source: string;
  publishedDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface JobFilters {
  search?: string;
  category?: string;
  jobType?: string;
  location?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  categories: string[];
  jobTypes: string[];
  sources: Array<{ source: string; count: number }>;
}

class ApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async startImport(source: string, feedUrl: string): Promise<{ success: boolean; message: string; importId: string }> {
    return this.fetch('/api/imports/start', {
      method: 'POST',
      body: JSON.stringify({ source, feedUrl }),
    });
  }

  async getImportHistory(page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    data: ImportLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.fetch(`/api/imports/history?page=${page}&limit=${limit}`);
  }

  async getImportById(id: string): Promise<{ success: boolean; data: ImportLog }> {
    return this.fetch(`/api/imports/${id}`);
  }

  async getImportStats(): Promise<{ success: boolean; data: ImportStats }> {
    return this.fetch('/api/imports/stats');
  }

  async getQueueStatus(): Promise<{ success: boolean; data: QueueStatus }> {
    return this.fetch('/api/imports/queue/status');
  }

  async runManualImport(): Promise<{ success: boolean; message: string; importId: string }> {
    return this.fetch('/api/imports/manual', {
      method: 'POST',
    });
  }

  async getCronStatus(): Promise<{ success: boolean; data: { active: boolean; jobs: string[] } }> {
    return this.fetch('/api/imports/cron/status');
  }

  async getJobs(filters: JobFilters = {}): Promise<{
    success: boolean;
    data: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    return this.fetch(`/api/jobs?${queryParams.toString()}`);
  }

  async getJobById(id: string): Promise<{ success: boolean; data: Job }> {
    return this.fetch(`/api/jobs/${id}`);
  }

  async getJobCategories(): Promise<{ success: boolean; data: string[] }> {
    return this.fetch('/api/jobs/categories');
  }

  async getJobTypes(): Promise<{ success: boolean; data: string[] }> {
    return this.fetch('/api/jobs/types');
  }

  async getJobStats(): Promise<{ success: boolean; data: JobStats }> {
    return this.fetch('/api/jobs/stats');
  }

  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    return this.fetch('/api/health');
  }
}

export const apiClient = new ApiClient();
export type { ImportLog, QueueStatus, ImportStats, Job, JobFilters, JobStats };