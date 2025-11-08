import { Request, Response } from 'express';
import { ImportService } from '../services/importService';
import { CronService } from '../services/cronService';

const importService = new ImportService();
const cronService = new CronService();

export class ImportController {
  async startImport(req: Request, res: Response): Promise<void> {
    try {
      const { source, feedUrl } = req.body;

      if (!source || !feedUrl) {
        res.status(400).json({
          success: false,
          error: 'Source and feedUrl are required',
        });
        return;
      }

      const importId = await importService.startImportJob({
        source: source as 'jobicy' | 'higheredjobs',
        feedUrl,
      });

      res.json({
        success: true,
        data: {
          importId,
          message: 'Import job started successfully',
        },
      });
    } catch (error) {
      console.error('Error starting import:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start import job',
      });
    }
  }

  async getImportHistory(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const result = await importService.getImportHistory(limit, offset);

      res.json({
        success: true,
        data: {
          imports: result.imports,
          pagination: {
            page,
            limit,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            totalPages: Math.ceil(result.totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching import history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch import history',
      });
    }
  }

  async getImportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const importLog = await importService.getImportById(id);

      res.json({
        success: true,
        data: importLog,
      });
    } catch (error) {
      console.error('Error fetching import by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch import details',
      });
    }
  }

  async getImportStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await importService.getImportStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching import stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch import statistics',
      });
    }
  }

  async getQueueStatus(req: Request, res: Response): Promise<void> {
    try {
      const queueStatus = await importService.getQueueStatus();

      res.json({
        success: true,
        data: queueStatus,
      });
    } catch (error) {
      console.error('Error fetching queue status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch queue status',
      });
    }
  }

  async runManualImport(req: Request, res: Response): Promise<void> {
    try {
      const { source, feedUrl } = req.body;

      if (source && feedUrl) {
        await cronService.runManualImport(source, feedUrl);
      } else {
        await cronService.runManualImport();
      }

      res.json({
        success: true,
        message: 'Manual import started successfully',
      });
    } catch (error) {
      console.error('Error running manual import:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run manual import',
      });
    }
  }

  async getCronStatus(req: Request, res: Response): Promise<void> {
    try {
      const cronStatus = cronService.getStatus();

      res.json({
        success: true,
        data: cronStatus,
      });
    } catch (error) {
      console.error('Error fetching cron status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cron status',
      });
    }
  }
}