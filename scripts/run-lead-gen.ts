/**
 * Script to run a lead generation cycle
 */

import { runLeadGenerationCycle } from '../src/services/lead-generation-service';
import { sendLeadNotification } from '../src/services/telegram-service';
import { createLogger } from '../src/services/logger';

const logger = createLogger('run-lead-gen');

async function main() {
  const orgId = 'a0000000-0000-0000-0000-000000000001'; // CallWaiting AI
  const industry = process.argv[2] || 'Medical Aesthetics';
  const location = process.argv[3] || 'London';

  logger.info(`Starting lead generation for ${industry} in ${location}...`);

  try {
    const leads = await runLeadGenerationCycle(orgId, industry, location);
    
    logger.info(`Cycle complete. Found and processed ${leads.length} leads.`);

    // Send notifications for high-potential leads (Tier A)
    for (const lead of leads) {
      if (lead.leadScore >= 8 && lead.directNumber) {
        await sendLeadNotification({
          businessName: lead.businessName,
          ownerName: lead.verifiedOwnerName || lead.ownerName,
          phone: lead.directNumber,
          leadScore: lead.leadScore,
          confidenceScore: lead.confidenceScore,
          tier: 'A',
          industry: lead.industry || industry
        });
      }
    }
  } catch (error) {
    logger.error('Lead generation cycle failed', error);
  }
}

main();
