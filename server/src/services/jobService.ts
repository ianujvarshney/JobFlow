import Job from '../models/Job';

export const getJobStats = async () => {
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ isActive: true });
  const jobsByCategory = await Job.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const jobsByType = await Job.aggregate([
    { $group: { _id: '$jobType', count: { $sum: 1 } } },
  ]);

  return {
    totalJobs,
    activeJobs,
    jobsByCategory,
    jobsByType,
  };
};