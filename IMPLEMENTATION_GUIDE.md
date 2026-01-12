# Implementation Guide: Lead Generation Integration

The lead generation system has been integrated into the Voxanne backend.

## Files Created/Modified:

1.  **`backend/src/services/lead-generation-service.ts`**: Core logic for API discovery and browser audit.
2.  **`backend/src/services/telegram-service.ts`**: Handles Telegram notifications for high-potential leads.
3.  **`backend/src/routes/lead-generation.ts`**: API endpoint to trigger lead generation.
4.  **`backend/scripts/run-lead-gen.ts`**: CLI script for manual execution.
5.  **`backend/src/server.ts`**: Registered the new lead-gen routes.

## How to use:

1.  **Configure Keys**: Add your API keys to the `.env` file.
2.  **Get Chat ID**: To receive Telegram notifications, you need your Chat ID. You can get it by messaging the bot and checking `https://api.telegram.org/bot<TOKEN>/getUpdates`.
3.  **Run**: Use the API or the script to start finding leads.
