import { Request, Response } from 'express';
import { getJobStats } from '../services/jobService';
import { ImportService } from '../services/importService';

const importService = new ImportService();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [jobStats, importStats] = await Promise.all([
      getJobStats(),
      importService.getImportStats(),
    ]);

    res.json({
      success: true,
      data: {
        jobStats,
        importStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
  }
};