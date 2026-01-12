# VoxANNE Lead Generation & Qualification System

This system automates the discovery, verification, and qualification of high-value business leads for CallWaiting AI.

## Architecture

1.  **Discovery**: Uses Companies House (UK), Google Places, and Actify APIs to find potential leads.
2.  **Verification (Browser Audit)**: Simulates a browser visit to filter out gatekeepers and identify direct owner contact details.
3.  **Scoring**: Leads are scored (1-10) based on their fit for CallWaiting AI.
4.  **Integration**: Qualified leads are automatically imported into the Supabase `leads` and `lead_scores` tables.
5.  **Notification**: High-potential (Tier A) leads trigger an immediate Telegram notification via the Voxanne bot.

## Setup

### 1. Environment Variables

Add the following to your `.env` file in the `backend` directory:

```env
# Lead Generation APIs
COMPANIES_HOUSE_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here
ACTIFY_API_KEY=your_key_here

# Telegram Notification
TELEGRAM_BOT_TOKEN=8557291791:AAHpFseoDh-tRgTwzBS3WNWeyEMpx8Uiew0
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 2. Running the System

#### Via API
You can trigger a lead generation cycle via the API:
`POST /api/lead-gen/run`
Body: `{ "industry": "Medical Aesthetics", "location": "London" }`

#### Via Script
You can also run it manually using the provided script:
```bash
cd backend
npx ts-node scripts/run-lead-gen.ts "Medical Aesthetics" "London"
```

## Database Mapping

| Source Field | Supabase `leads` Column |
|---|---|
| Business Name | `company_name` |
| Owner Name | `contact_name` |
| Direct Phone | `phone` |
| Industry | `industry` |
| Lead Score | `lead_scores.total_score` |
| Tier | `lead_scores.priority_tier` |

## Next Steps
- [ ] Obtain and add API keys to `.env`.
- [ ] Set up a cron job to run the lead generation cycle periodically.
- [ ] Refine the "Browser Audit" logic with a dedicated scraping service if needed.
