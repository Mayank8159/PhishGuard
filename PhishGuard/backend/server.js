/**
 * Example PhishGuard Backend Server
 * 
 * To use this:
 * 1. Create a backend/ folder in your project
 * 2. Run: npm init -y && npm install express cors dotenv axios
 * 3. Create this file as server.js
 * 4. Run: node server.js
 * 
 * Then update .env.local with: EXPO_PUBLIC_API_URL=http://your-ip:3000/api
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// URL Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { url, userId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Perform threat analysis
    const analysis = performThreatAnalysis(url);

    res.json({
      url,
      status: analysis.status,
      riskScore: analysis.riskScore,
      threats: analysis.threats,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Perform local threat analysis on URL
 * This is a basic implementation - in production, integrate with:
 * - Google Safe Browsing API
 * - VirusTotal API
 * - PhishTank API
 * - Custom ML models
 */
function performThreatAnalysis(url) {
  const urlLower = url.toLowerCase();
  let riskScore = 0;
  const threats = [];

  // Check for suspicious patterns
  const suspiciousPatterns = [
    { pattern: 'bitly', risk: 10, threat: 'URL shortener detected' },
    { pattern: 'verify', risk: 20, threat: 'Verification keyword' },
    { pattern: 'confirm', risk: 20, threat: 'Confirmation keyword' },
    { pattern: 'urgent', risk: 15, threat: 'Urgency keyword' },
    { pattern: 'update', risk: 15, threat: 'Update keyword' },
    { pattern: 'click-here', risk: 25, threat: 'Click bait keyword' },
  ];

  suspiciousPatterns.forEach(({ pattern, risk, threat }) => {
    if (urlLower.includes(pattern)) {
      riskScore += risk;
      if (!threats.includes(threat)) {
        threats.push(threat);
      }
    }
  });

  // Check URL structure
  if (urlLower.includes('..') || urlLower.match(/\/\//g)?.length > 1) {
    riskScore += 25;
    threats.push('Suspicious URL structure');
  }

  // Check for HTTPS
  if (!urlLower.startsWith('https')) {
    riskScore += 15;
    threats.push('No HTTPS encryption');
  }

  // Check for IP address instead of domain
  const ipPattern = /\d+\.\d+\.\d+\.\d+/;
  if (ipPattern.test(url)) {
    riskScore += 30;
    threats.push('Using IP address instead of domain');
  }

  // Check for suspicious TLDs
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf'];
  if (suspiciousTlds.some(tld => urlLower.includes(tld))) {
    riskScore += 20;
    threats.push('Suspicious top-level domain');
  }

  // Determine status based on risk score
  let status;
  if (riskScore >= 60) {
    status = 'dangerous';
  } else if (riskScore >= 30) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  return {
    status,
    riskScore,
    threats: threats.slice(0, 3), // Limit to 3 threats
  };
}

// Example: Integrate with Google Safe Browsing API
async function checkGoogleSafeBrowsing(url) {
  // const API_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;
  // const response = await axios.post(
  //   `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
  //   {
  //     client: { clientId: 'phishguard', clientVersion: '1.0' },
  //     threatInfo: {
  //       threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
  //       platformTypes: ['ANY_PLATFORM'],
  //       threatEntryTypes: ['URL'],
  //       threatEntries: [{ url }],
  //     },
  //   }
  // );
  // return response.data;
}

// Example: Integrate with VirusTotal API
async function checkVirusTotal(url) {
  // const API_KEY = process.env.VIRUSTOTAL_API_KEY;
  // const params = new URLSearchParams();
  // params.append('url', url);
  // const response = await axios.post(
  //   'https://www.virustotal.com/api/v3/urls',
  //   params,
  //   {
  //     headers: { 'x-apikey': API_KEY },
  //   }
  // );
  // return response.data;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PhishGuard API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Analyze endpoint: POST http://localhost:${PORT}/api/analyze`);
});
