# PhishGuard Backend Setup Guide

## Setting Up Supabase

### 1. Create a Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - Name: PhishGuard
   - Database Password: (create a strong password)
   - Region: Choose closest to your location
   - Pricing Plan: Free (for development)
4. Click "Create new project"
5. Wait for the project to be created (5-10 minutes)

### 2. Get Your Credentials
1. Go to Project Settings → API
2. Copy the following:
   - **Project URL**: This is your SUPABASE_URL
   - **Anon (Public) Key**: This is your SUPABASE_ANON_KEY
3. Paste these into `.env.local` file in your project root

### 3. Set Up the Database Schema
1. In Supabase, go to SQL Editor
2. Copy the entire content from `database/schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute all queries
5. Verify tables are created in the "Tables" section

### 4. Update Environment Variables
Update `.env.local` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Connecting Your Backend API

### Option 1: Using Supabase Edge Functions (Recommended)
1. Install Supabase CLI: `npm install -g supabase`
2. Initialize: `supabase init`
3. Create an edge function for URL analysis
4. Deploy with `supabase functions deploy`

### Option 2: Using Your Own Backend Server

#### Create a Node.js Backend Server

Create a `backend/` directory and set up a simple Express server:

```
npm init -y
npm install express cors dotenv axios
```

Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// URL analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { url, userId } = req.body;
  
  try {
    // Call your threat detection service
    // This is where you'd integrate with services like:
    // - Google Safe Browsing API
    // - VirusTotal API
    // - PhishTank API
    
    const analysis = await analyzeThreat(url);
    
    res.json({
      url,
      status: analysis.status,
      riskScore: analysis.riskScore,
      threats: analysis.threats,
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

async function analyzeThreat(url) {
  // Implement your threat detection logic
  // Return { status, riskScore, threats }
  return {
    status: 'safe',
    riskScore: 0,
    threats: []
  };
}

app.listen(3000, () => console.log('Server running on :3000'));
```

## Testing the Integration

### 1. Sign Up/Login Flow
- The app uses Supabase authentication
- Users can sign up with email/password
- Data is automatically synced to Supabase

### 2. URL Analysis
- Users can enter URLs in the "Threat Analysis" section
- Results are saved to Supabase
- Stats are updated in real-time

### 3. View Scan History
- Go to History tab to see all scans
- Data comes from Supabase database
- Filter by status (Safe, Warning, Threats)

## API Integration Examples

### Integrating with Google Safe Browsing API
```
npm install @google/maps-gmp-wrapper
```

### Integrating with VirusTotal API
```
npm install virustotal-api
```

### Integrating with PhishTank API
```
npm install node-phishtank
```

## Production Setup

1. Enable authentication in Supabase (email/password, OAuth providers)
2. Set up Row Level Security (RLS) policies
3. Deploy backend to production (Heroku, Railway, Vercel)
4. Use production API URL in environment variables
5. Set up monitoring and logging
6. Configure rate limiting for API endpoints

## Troubleshooting

### Issue: "Connection refused" error
- Make sure Supabase project is created and running
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env.local
- Check network connectivity

### Issue: "Authentication failed"
- Verify user credentials are correct
- Check if user exists in Supabase auth
- Clear app cache and retry

### Issue: "No data showing up"
- Run the schema.sql file again
- Check RLS policies are correct
- Verify user ID matches in database

## Next Steps

1. Implement real threat detection algorithms
2. Integrate with multiple threat intelligence APIs
3. Add browser extension for automatic URL checking
4. Set up webhook notifications
5. Build admin dashboard for threat analytics
6. Add machine learning models for pattern detection
