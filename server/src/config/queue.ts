import Bull from 'bull';
import createRedisClient from './redis';

const redisClient = createRedisClient();

export interface JobImportData {
  source: string;
  feedUrl: string;
  importLogId: string;
}

export interface JobProcessData {
  jobData: any;
  source: string;
  importLogId: string;
}

export const jobImportQueue = new Bull<JobImportData>('job-import', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const jobProcessQueue = new Bull<JobProcessData>('job-process', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 500,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const initializeQueues = () => {
  jobImportQueue.on('completed', (job) => {
    console.log(`Job import completed: ${job.id}`);
  });

  jobImportQueue.on('failed', (job, err) => {
    console.error(`Job import failed: ${job.id}`, err);
  });

  jobProcessQueue.on('completed', (job) => {
    console.log(`Job process completed: ${job.id}`);
  });

  jobProcessQueue.on('failed', (job, err) => {
    console.error(`Job process failed: ${job.id}`, err);
  });
};

export default {
  jobImportQueue,
  jobProcessQueue,
  initializeQueues,
};