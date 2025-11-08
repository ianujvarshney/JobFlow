import mongoose, { Document, Schema } from 'mongoose';

export interface IImportLog extends Document {
  source: string;
  feedUrl: string;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failedJobsDetails: Array<{
    jobId: string;
    error: string;
    timestamp: Date;
  }>;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

const ImportLogSchema: Schema = new Schema({
  source: {
    type: String,
    required: true,
    enum: ['jobicy', 'higheredjobs']
  },
  feedUrl: {
    type: String,
    required: true
  },
  totalFetched: {
    type: Number,
    required: true,
    default: 0
  },
  totalImported: {
    type: Number,
    required: true,
    default: 0
  },
  newJobs: {
    type: Number,
    required: true,
    default: 0
  },
  updatedJobs: {
    type: Number,
    required: true,
    default: 0
  },
  failedJobs: {
    type: Number,
    required: true,
    default: 0
  },
  failedJobsDetails: [{
    jobId: String,
    error: String,
    timestamp: { type: Date, default: Date.now }
  }],
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: Date,
  duration: Number,
  status: {
    type: String,
    required: true,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  error: String
}, {
  timestamps: true
});

ImportLogSchema.index({ source: 1 });
ImportLogSchema.index({ status: 1 });
ImportLogSchema.index({ startedAt: -1 });

export default mongoose.model<IImportLog>('ImportLog', ImportLogSchema);