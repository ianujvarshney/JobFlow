import { Router } from 'express';
import { ImportController } from '../controllers/importController';
import { JobController } from '../controllers/jobController';
import { getDashboardStats } from '../controllers/dashboardController';

const router = Router();
const importController = new ImportController();
const jobController = new JobController();

router.post('/api/imports/start', importController.startImport);
router.get('/api/imports/history', importController.getImportHistory);
router.get('/api/imports/stats', importController.getImportStats);
router.get('/api/imports/queue/status', importController.getQueueStatus);
router.post('/api/imports/manual', importController.runManualImport);
router.get('/api/imports/cron/status', importController.getCronStatus);
router.get('/api/imports/:id', importController.getImportById);

router.get('/api/jobs', jobController.getJobs);
router.get('/api/jobs/categories', jobController.getJobCategories);
router.get('/api/jobs/types', jobController.getJobTypes);
router.get('/api/jobs/stats', jobController.getJobStats);
router.get('/api/jobs/:id', jobController.getJobById);

router.get('/api/dashboard/stats', getDashboardStats);

router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Job Importer API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;