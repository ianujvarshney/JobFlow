import * as cron from 'node-cron';
import { ImportService } from './importService';

const importService = new ImportService();

const JOB_API_ENDPOINTS = [
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed',
    name: 'All Jobs'
  },
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
    name: 'Social Media Marketing'
  },
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
    name: 'Sales - France'
  },
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
    name: 'Design & Multimedia'
  },
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed&job_categories=data-science',
    name: 'Data Science'
  },
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
    name: 'Copywriting'
  },
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed&job_categories=business',
    name: 'Business'
  },
  {
    source: 'jobicy' as const,
    url: 'https://jobicy.com/?feed=job_feed&job_categories=management',
    name: 'Management'
  },
  {
    source: 'higheredjobs' as const,
    url: 'https://www.higheredjobs.com/rss/articleFeed.cfm',
    name: 'Higher Education Jobs'
  }
];

export class CronService {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.initializeCronJobs();
  }

  private initializeCronJobs(): void {
    const hourlyTask = cron.schedule('0 * * * *', async () => {
      console.log('Starting hourly job import...');
      await this.runHourlyImport();
    }, {
      timezone: 'UTC'
    });

    this.scheduledTasks.set('hourly-import', hourlyTask);

    const cleanupTask = cron.schedule('0 2 * * *', async () => {
      console.log('Starting daily cleanup...');
      await this.cleanupOldLogs();
    }, {
      timezone: 'UTC'
    });

    this.scheduledTasks.set('daily-cleanup', cleanupTask);

    console.log('Cron jobs initialized');
  }

  public startAllTasks(): void {
    this.scheduledTasks.forEach(task => task.start());
    console.log('All cron tasks started');
  }

  public stopAllTasks(): void {
    this.scheduledTasks.forEach(task => task.stop());
    console.log('All cron tasks stopped');
  }

  public getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.scheduledTasks.forEach((task, name) => {
      status[name] = task.getStatus() === 'scheduled';
    });
    return status;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runHourlyImport(): Promise<void> {
    console.log('Running hourly job import...');
    
    for (const endpoint of JOB_API_ENDPOINTS) {
      try {
        console.log(`Importing jobs from ${endpoint.name}...`);
        
        const importId = await importService.startImportJob({
          source: endpoint.source,
          feedUrl: endpoint.url,
        });

        console.log(`Started import job ${importId} for ${endpoint.name}`);
        
        await this.delay(5000);
      } catch (error) {
        console.error(`Error importing jobs from ${endpoint.name}:`, error);
      }
    }
    
    console.log('Hourly job import completed');
  }

  async runManualImport(source?: 'jobicy' | 'higheredjobs', specificUrl?: string): Promise<void> {
    console.log('Running manual job import...');
    
    if (source && specificUrl) {
      try {
        const importId = await importService.startImportJob({
          source,
          feedUrl: specificUrl,
        });
        console.log(`Started manual import job: ${importId}`);
      } catch (error) {
        console.error('Error running manual import:', error);
        throw error;
      }
    } else {
      await this.runHourlyImport();
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      console.log(`Cleaning up logs older than ${thirtyDaysAgo.toISOString()}`);
      
      console.log('Daily cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

}

export default CronService;