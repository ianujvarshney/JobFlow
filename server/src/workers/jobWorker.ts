import { Job } from 'bull';
import { jobImportQueue, jobProcessQueue, JobImportData, JobProcessData } from '../config/queue';
import { JobFetcherService } from '../services/jobFetcher';
import { JobProcessorService } from '../services/jobProcessor';
import ImportLog from '../models/ImportLog';

const jobFetcher = new JobFetcherService();
const jobProcessor = new JobProcessorService();

export const startJobImportWorker = () => {
  jobImportQueue.process(async (job: Job<JobImportData>) => {
    const { source, feedUrl, importLogId } = job.data;
    
    console.log(`Starting job import from ${source}: ${feedUrl}`);
    
    try {
      await ImportLog.findByIdAndUpdate(importLogId, {
        status: 'running',
        startedAt: new Date(),
      });

      const jobs = await jobFetcher.fetchJobsFromAPI(feedUrl, source);
      
      console.log(`Fetched ${jobs.length} jobs from ${source}`);

      await ImportLog.findByIdAndUpdate(importLogId, {
        totalFetched: jobs.length,
      });

      const batchSize = jobProcessor.getBatchSize();
      
      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(jobData =>
            jobProcessQueue.add({
              jobData,
              source,
              importLogId,
            }, {
              delay: i * 100,
            })
          )
        );
      }

      console.log(`Added ${jobs.length} jobs to processing queue`);
      
      return { 
        totalJobs: jobs.length,
        message: `Successfully queued ${jobs.length} jobs for processing`
      };
    } catch (error) {
      console.error(`Error in job import worker:`, error);
      
      await ImportLog.findByIdAndUpdate(importLogId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      });
      
      throw error;
    }
  });
};

export const startJobProcessWorker = () => {
  const maxConcurrency = jobProcessor.getMaxConcurrency();
  
  jobProcessQueue.process(maxConcurrency, async (job: Job<JobProcessData>) => {
    const { jobData, source, importLogId } = job.data;
    
    try {
      await jobProcessor.processJob({
        jobData,
        source,
        importLogId,
      });
      
      return {
        jobId: jobData.externalId,
        status: 'processed',
      };
    } catch (error) {
      console.error(`Error processing job ${jobData.externalId}:`, error);
      throw error;
    }
  });
};

import { Server } from 'socket.io';

export const setupQueueCompletionMonitoring = (io: Server) => {
  jobProcessQueue.on('completed', async (job, result) => {
    const importLogId = job.data.importLogId;

    const counts = await jobProcessQueue.getJobCounts();
    if (counts.waiting === 0 && counts.active === 0) {
      const importLog = await ImportLog.findById(importLogId);
      if (importLog && importLog.status !== 'completed') {
        importLog.status = 'completed';
        importLog.completedAt = new Date();
        await importLog.save();

        io.emit('import-completed', importLog);
      }
    }
  });
  jobImportQueue.on('completed', async (job, result) => {
    console.log(`Job import completed: ${job.id}`, result);
    
    const { importLogId } = job.data;
    await checkImportCompletion(importLogId);
  });

  jobProcessQueue.on('completed', async (job) => {
    const { importLogId } = job.data;
    await checkImportCompletion(importLogId);
  });
};

async function checkImportCompletion(importLogId: string) {
  try {
    const importLog = await ImportLog.findById(importLogId);
    if (!importLog) return;

    const completedJobs = importLog.totalImported;
    const totalJobs = importLog.totalFetched;
    
    if (completedJobs + importLog.failedJobs >= totalJobs && importLog.status === 'running') {
      const completedAt = new Date();
      const duration = completedAt.getTime() - importLog.startedAt.getTime();
      
      await ImportLog.findByIdAndUpdate(importLogId, {
        status: 'completed',
        completedAt,
        duration,
      });
      
      console.log(`Import completed: ${importLogId}`);
    }
  } catch (error) {
    console.error('Error checking import completion:', error);
  }
}