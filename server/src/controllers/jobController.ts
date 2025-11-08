import { Request, Response } from 'express';
import Job from '../models/Job';

export class JobController {
  async getJobs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      
      const filters: any = {};
      
      if (req.query.category) {
        filters.category = req.query.category;
      }
      
      if (req.query.jobType) {
        filters.jobType = req.query.jobType;
      }
      
      if (req.query.location) {
        filters.location = { $regex: req.query.location, $options: 'i' };
      }
      
      if (req.query.search) {
        filters.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { company: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
      }

      const [jobs, totalCount] = await Promise.all([
        Job.find(filters)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
        Job.countDocuments(filters)
      ]);

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: offset + limit < totalCount,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch jobs',
      });
    }
  }

  async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const job = await Job.findById(id);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found',
        });
        return;
      }

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job details',
      });
    }
  }

  async getJobCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Job.distinct('category', { isActive: true });

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Error fetching job categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job categories',
      });
    }
  }

  async getJobTypes(req: Request, res: Response): Promise<void> {
    try {
      const jobTypes = await Job.distinct('jobType', { isActive: true });

      res.json({
        success: true,
        data: jobTypes,
      });
    } catch (error) {
      console.error('Error fetching job types:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job types',
      });
    }
  }

  async getJobStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await Job.aggregate([
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            activeJobs: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            jobsByCategory: {
              $push: {
                $cond: [
                  { $eq: ['$isActive', true] },
                  '$category',
                  null
                ]
              }
            },
            jobsByType: {
              $push: {
                $cond: [
                  { $eq: ['$isActive', true] },
                  '$jobType',
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalJobs: 1,
            activeJobs: 1,
            jobsByCategory: {
              $filter: {
                input: '$jobsByCategory',
                as: 'category',
                cond: { $ne: ['$$category', null] }
              }
            },
            jobsByType: {
              $filter: {
                input: '$jobsByType',
                as: 'type',
                cond: { $ne: ['$$type', null] }
              }
            }
          }
        }
      ]);

      const categoryStats = await Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const typeStats = await Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$jobType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const result = {
        totalJobs: stats[0]?.totalJobs || 0,
        activeJobs: stats[0]?.activeJobs || 0,
        topCategories: categoryStats,
        jobTypes: typeStats,
      };

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error fetching job stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job statistics',
      });
    }
  }
}