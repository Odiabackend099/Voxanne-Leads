/**
 * Lead Generation Routes
 */

import { Router } from 'express';
import { runLeadGenerationCycle } from '../services/lead-generation-service';
import { createLogger } from '../services/logger';
import { auth } from '../middleware/auth';

const router = Router();
const logger = createLogger('lead-gen-route');

/**
 * POST /api/lead-gen/run
 * Triggers a lead generation cycle
 */
router.post('/run', auth, async (req: any, res) => {
  const { industry, location } = req.body;
  const orgId = req.user.org_id;

  if (!industry || !location) {
    return res.status(400).json({ error: 'Industry and location are required' });
  }

  try {
    // Run in background
    runLeadGenerationCycle(orgId, industry, location)
      .then(leads => {
        logger.info(`Background lead gen cycle complete for ${orgId}`);
      })
      .catch(err => {
        logger.error(`Background lead gen cycle failed for ${orgId}`, err);
      });

    res.json({ message: 'Lead generation cycle started in background' });
  } catch (error) {
    logger.error('Error starting lead generation cycle', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
