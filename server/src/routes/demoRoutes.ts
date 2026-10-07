import { Router } from 'express';
import { DemoController } from '../controllers/demoController';

const router = Router();

router.get('/scenarios', DemoController.seedScenarios);
router.post('/scenario/:scenarioId', DemoController.loadScenario);

export default router;
