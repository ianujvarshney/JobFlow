import Job, { IJob } from '../models/Job';
import ImportLog from '../models/ImportLog';
import { JobProcessData } from '../config/queue';

export class JobProcessorService {
  private batchSize: number;
  private maxConcurrency: number;

  constructor() {
    this.batchSize = parseInt(process.env.BATCH_SIZE || '100');
    this.maxConcurrency = parseInt(process.env.MAX_CONCURRENCY || '5');
  }

  async processJob(jobData: JobProcessData): Promise<void> {
    const { jobData: jobInfo, source, importLogId } = jobData;

    try {
      const existingJob = await Job.findOne({
        externalId: jobInfo.externalId,
        source: source
      });

      if (existingJob) {
        await this.updateExistingJob(existingJob, jobInfo, importLogId);
      } else {
        await this.createNewJob(jobInfo, source, importLogId);
      }
    } catch (error) {
      console.error(`Error processing job ${jobInfo.externalId}:`, error);
      await this.logFailedJob(importLogId, jobInfo.externalId, error as Error);
      throw error;
    }
  }

  private async createNewJob(jobInfo: any, source: string, importLogId: string): Promise<void> {
    try {
      const newJob = new Job({
        ...jobInfo,
        source,
        isActive: true,
      });

      await newJob.save();

      await ImportLog.findByIdAndUpdate(importLogId, {
        $inc: { 
          totalImported: 1, 
          newJobs: 1 
        }
      });

      console.log(`Created new job: ${newJob.title} (${newJob.externalId})`);
    } catch (error) {
      console.error('Error creating new job:', error);
      throw error;
    }
  }

  private async updateExistingJob(existingJob: IJob, jobInfo: any, importLogId: string): Promise<void> {
    try {
      const hasChanges = this.hasJobChanges(existingJob, jobInfo);

      if (hasChanges) {
        await Job.findByIdAndUpdate(existingJob._id, {
          ...jobInfo,
          updatedAt: new Date(),
        });

        await ImportLog.findByIdAndUpdate(importLogId, {
          $inc: { 
            totalImported: 1, 
            updatedJobs: 1 
          }
        });

        console.log(`Updated job: ${existingJob.title} (${existingJob.externalId})`);
      }
    } catch (error) {
      console.error('Error updating existing job:', error);
      throw error;
    }
  }

  private hasJobChanges(existingJob: IJob, newJobData: any): boolean {
    const fieldsToCheck = ['title', 'description', 'company', 'location', 'salary'];
    
    return fieldsToCheck.some(field => {
      const existingValue = (existingJob as any)[field];
      const newValue = newJobData[field];
      return existingValue !== newValue;
    });
  }

  private async logFailedJob(importLogId: string, jobId: string, error: Error): Promise<void> {
    try {
      await ImportLog.findByIdAndUpdate(importLogId, {
        $inc: { failedJobs: 1 },
        $push: {
          failedJobsDetails: {
            jobId,
            error: error.message,
            timestamp: new Date(),
          }
        }
      });
    } catch (logError) {
      console.error('Error logging failed job:', logError);
    }
  }

  async processBatchJobs(jobs: any[], source: string, importLogId: string): Promise<void> {
    const batchSize = this.batchSize;
    const maxConcurrency = this.maxConcurrency;

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(jobs.length / batchSize)}`);

      await Promise.allSettled(
        batch.map(job => 
          this.processJob({
            jobData: job,
            source,
            importLogId
          })
        )
      );
    }
  }

  getBatchSize(): number {
    return this.batchSize;
  }

  getMaxConcurrency(): number {
    return this.maxConcurrency;
  }
}