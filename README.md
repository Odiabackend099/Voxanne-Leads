# VoxANNE Lead Generation & Qualification System

This system automates the discovery, verification, and qualification of high-value business leads for CallWaiting AI.

## Autonomous Features

1.  **Discovery & Deduplication**: Uses Companies House (UK), Google Places, and Actify APIs. Automatically merges leads found across multiple sources to prevent duplicates.
2.  **Advanced Verification (Browser Audit)**: 
    *   Filters gatekeepers (0800/0845 numbers).
    *   Extracts direct mobile numbers (UK 07 numbers).
    *   Assigns a **Confidence Score (0-100%)**.
3.  **Shadow Audit (Personalization)**: Automatically researches recent news (branch openings, awards) to create a personalized opening line for your calling agent.
4.  **Email Validation**: Checks deliverability of discovered emails to reduce bounce rates.
5.  **Automated Scheduling**: Includes a GitHub Action to run the cycle every day at 8 AM UTC.
6.  **Real-time Alerts**: High-potential (Tier A) leads with 80%+ confidence trigger a Telegram notification.

## Setup

### 1. Environment Variables & Secrets

For local runs, add these to your `.env` file. For automated runs, add them as **GitHub Actions Secrets**:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

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
