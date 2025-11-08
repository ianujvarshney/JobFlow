import mongoose from 'mongoose';
import ImportLog from '../models/ImportLog';
import { jobImportQueue, jobProcessQueue } from '../config/queue';

export interface ImportJobParams {
  source: 'jobicy' | 'higheredjobs';
  feedUrl: string;
}

export class ImportService {
  async startImportJob(params: ImportJobParams): Promise<string> {
    try {
      const importLog = new ImportLog({
        source: params.source,
        feedUrl: params.feedUrl,
        status: 'running',
        totalFetched: 0,
        totalImported: 0,
        newJobs: 0,
        updatedJobs: 0,
        failedJobs: 0,
        failedJobsDetails: [],
        startedAt: new Date(),
      });

      await importLog.save();

      await jobImportQueue.add({
        source: params.source,
        feedUrl: params.feedUrl,
        importLogId: (importLog._id as mongoose.Types.ObjectId).toString(),
      }, {
        delay: 1000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      console.log(`Started import job: ${importLog._id}`);
      
      return (importLog._id as mongoose.Types.ObjectId).toString();
    } catch (error) {
      console.error('Error starting import job:', error);
      throw error;
    }
  }

  async getImportHistory(limit: number = 50, offset: number = 0) {
    try {
      const totalCount = await ImportLog.countDocuments();
      
      const imports = await ImportLog.find()
        .sort({ startedAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      return {
        imports,
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    } catch (error) {
      console.error('Error fetching import history:', error);
      throw error;
    }
  }

  async getImportById(importId: string) {
    try {
      const importLog = await ImportLog.findById(importId);
      
      if (!importLog) {
        throw new Error('Import log not found');
      }

      return importLog;
    } catch (error) {
      console.error('Error fetching import by ID:', error);
      throw error;
    }
  }

  async getImportStats() {
    try {
      const stats = await ImportLog.aggregate([
        {
          $group: {
            _id: null,
            totalImports: { $sum: 1 },
            totalJobsFetched: { $sum: '$totalFetched' },
            totalJobsImported: { $sum: '$totalImported' },
            totalNewJobs: { $sum: '$newJobs' },
            totalUpdatedJobs: { $sum: '$updatedJobs' },
            totalFailedJobs: { $sum: '$failedJobs' },
            completedImports: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failedImports: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            runningImports: {
              $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalImports: 0,
        totalJobsFetched: 0,
        totalJobsImported: 0,
        totalNewJobs: 0,
        totalUpdatedJobs: 0,
        totalFailedJobs: 0,
        completedImports: 0,
        failedImports: 0,
        runningImports: 0,
      };
    } catch (error) {
      console.error('Error fetching import stats:', error);
      throw error;
    }
  }

  async getQueueStatus() {
    try {
      const [importQueueStats, processQueueStats] = await Promise.all([
        jobImportQueue.getJobCounts(),
        jobProcessQueue.getJobCounts(),
      ]);

      return {
        importQueue: {
          waiting: importQueueStats.waiting || 0,
          active: importQueueStats.active || 0,
          completed: importQueueStats.completed || 0,
          failed: importQueueStats.failed || 0,
          delayed: importQueueStats.delayed || 0,
        },
        processQueue: {
          waiting: processQueueStats.waiting || 0,
          active: processQueueStats.active || 0,
          completed: processQueueStats.completed || 0,
          failed: processQueueStats.failed || 0,
          delayed: processQueueStats.delayed || 0,
        }
      };
    } catch (error) {
      console.error('Error fetching queue status:', error);
      throw error;
    }
  }
}