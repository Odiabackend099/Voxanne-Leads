/**
 * Telegram Notification Service
 * Sends alerts to the Voxanne bot when high-potential leads are found.
 */

import axios from 'axios';
import { createLogger } from './logger';

const logger = createLogger('telegram-notification');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8557291791:AAHpFseoDh-tRgTwzBS3WNWeyEMpx8Uiew0';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // User's chat ID to receive notifications

export interface LeadNotification {
  businessName: string;
  ownerName?: string;
  phone: string;
  leadScore: number;
  confidenceScore: number;
  tier: string;
  industry: string;
}

/**
 * Send a notification about a new high-potential lead
 */
export async function sendLeadNotification(lead: LeadNotification) {
  if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('Telegram Bot Token missing');
    return;
  }

  if (!TELEGRAM_CHAT_ID) {
    logger.warn('Telegram Chat ID missing. Cannot send notification.');
    return;
  }

  const message = `
🚀 *New High-Potential Lead Found!*

*Business:* ${lead.businessName}
*Owner:* ${lead.ownerName || 'Unknown'}
*Phone:* ${lead.phone}
*Industry:* ${lead.industry}
*Lead Score:* ${lead.leadScore}/10
*Confidence:* ${lead.confidenceScore}%
*Tier:* ${lead.tier}

[Click to Call](tel:${lead.phone})
  `;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    logger.info(`Telegram notification sent for ${lead.businessName}`);
  } catch (error) {
    logger.error('Error sending Telegram notification', error);
  }
}

/**
 * Initialize the bot and get the chat ID (helper for setup)
 */
export async function getBotUpdates() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
    return response.data;
  } catch (error) {
    logger.error('Error getting Telegram updates', error);
    return null;
  }
}
