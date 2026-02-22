# PhishGuard Backend API

A FastAPI-based backend for the PhishGuard phishing detection application, integrated with Supabase for data persistence.

## Features

- 🚀 **FastAPI** - Modern, fast web framework
- 🔗 **Supabase Integration** - Cloud database for storing scan history
- 🧠 **Advanced Threat Analysis** - Multi-engine threat detection
- 📊 **User Statistics** - Track scanning history and statistics
- 🔐 **Security First** - HTTPS enforcement, credential harvesting detection
- 📱 **Cross-Platform** - Works with React Native, web, and desktop apps

## Quick Start

### 1. Prerequisites

- Python 3.9+
- pip or conda
- Supabase account (free tier available)

### 2. Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Supabase credentials
# Get from: https://app.supabase.com/project/[your-project]/settings/api
```

Contents of `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
API_PORT=8000
DEBUG=True
```

### 4. Run the Server

```bash
python main.py
```

Server runs at: `http://localhost:8000`

- API Docs: `http://localhost:8000/docs` (Swagger UI)
- Health Check: `http://localhost:8000/api/health`

## API Endpoints

### Analysis

#### Analyze Single URL
```
POST /api/analyze
Content-Type: application/json

{
    "url": "https://example.com",
    "user_id": "optional-user-id"
}
```

Response:
```json
{
    "url": "https://example.com",
    "status": "safe",
    "riskScore": 15,
    "threats": ["No HTTPS encryption"],
    "timestamp": "02:34 PM"
}
```

#### Analyze Multiple URLs
```
GET /api/bulk-analyze?urls=url1.com,url2.com,url3.com&user_id=user123
```

### User Endpoints

#### Get User Statistics
```
GET /api/user/{user_id}/stats
```

Response:
```json
{
    "threats_blocked": 5,
    "safe_sites": 12,
    "scans_total": 17,
    "protection_active": true
}
```

#### Get User Scans
```
GET /api/user/{user_id}/scans?limit=10&offset=0
```

#### Delete a Scan
```
DELETE /api/user/{user_id}/scans/{scan_id}
```

#### Get User Profile
```
GET /api/user/{user_id}/profile
```

#### Update User Profile
```
POST /api/user/{user_id}/profile
Content-Type: application/json

{
    "name": "New Name"
}
```

### Health Check
```
GET /api/health
```

Response:
```json
{
    "status": "ok",
    "timestamp": "2024-02-21T12:34:56",
    "supabase_connected": true
}
```

## Threat Detection Engine

The analyzer uses multiple detection methods:

### 1. **Pattern Detection**
- Suspicious keywords: verify, confirm, urgent, click, etc.
- Brand mimicking: PayPal, Amazon, Apple, Microsoft, etc.
- Credential harvesting: login, signin, password, etc.

### 2. **URL Structure Analysis**
- Double slashes: `http://http://example.com`
- Path traversal: URLs with `..`
- IP addresses instead of domains

### 3. **Security Protocol**
- HTTPS enforcement
- HTTP detection (penalizes missing encryption)

### 4. **Domain Analysis**
- Suspicious TLDs: `.tk`, `.ml`, `.ga`, `.cf`, `.xyz`, etc.
- Homograph attacks (character substitution)

### Risk Score Calculation

| Risk Factor | Score |
|---|---|
| Suspicious pattern | +10-25 |
| Missing HTTPS | +15 |
| IP-based URL | +30 |
| Suspicious TLD | +20 |
| Credential harvesting | +25 |
| Structure anomalies | +20-25 |

**Status Classification:**
- **Safe** (0-29 points): Low risk
- **Warning** (30-59 points): Suspicious characteristics
- **Dangerous** (60-100 points): Likely phishing

## Integration with Frontend

### React Native (Expo)

Update `.env` in your React Native app:
```
EXPO_PUBLIC_API_URL=http://your-ip:8000/api
```

### JavaScript/TypeScript

```typescript
const analyzeUrl = async (url: string) => {
    const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, user_id: 'user123' })
    });
    return response.json();
};
```

### cURL

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "user_id": "user123"}'
```

## Deployment

### Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create phishguard-api

# Set environment variables
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
heroku config:set DEBUG=False

# Deploy
git push heroku main
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy
railway up
```

### PythonAnywhere

1. Upload code to PythonAnywhere
2. Create virtual environment
3. Install dependencies
4. Configure web app to use FastAPI
5. Set environment variables in web app config

### Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

Build and run:
```bash
docker build -t phishguard-api .
docker run -e SUPABASE_URL=... -e SUPABASE_KEY=... -p 8000:8000 phishguard-api
```

## Advanced Configuration

### Rate Limiting

Edit `config.py`:
```python
RATE_LIMIT_PER_MINUTE=60
```

### CORS Configuration

Edit `main.py`:
```python
origins = [
    "http://localhost:8081",
    "https://yourdomain.com",
    # Add more allowed origins
]
```

### Custom Threat Engines

Extend `analyzer.py` with external APIs:

```python
# Google Safe Browsing
import requests

def check_google_safe_browsing(url):
    # Implementation here
    pass

# VirusTotal
def check_virustotal(url):
    # Implementation here
    pass

# PhishTank
def check_phishtank(url):
    # Implementation here
    pass
```

## Database Schema

The backend expects these Supabase tables:

### `users`
- `id` (UUID, primary key)
- `email` (text, unique)
- `name` (text)
- `total_scans` (integer)
- `threats_blocked` (integer)
- `created_at` (timestamp)

### `scan_history`
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `url` (text)
- `status` (text: 'safe', 'warning', 'dangerous')
- `risk_score` (integer)
- `metadata` (jsonb)
- `created_at` (timestamp)

### `security_stats`
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `threats_blocked` (integer)
- `safe_sites` (integer)
- `scans_today` (integer)
- `protection_active` (boolean)
- `updated_at` (timestamp)

See `BACKEND_SETUP.md` in the main project for SQL schema.

## Development

### Project Structure

```
backend/
├── main.py              # Main FastAPI app
├── config.py            # Configuration settings
├── analyzer.py          # Threat analysis engine
├── database.py          # Database operations
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
└── README.md           # This file
```

### Logging

All operations are logged to console. Debug logs show:
- API requests
- URL analysis details
- Database operations
- Error details

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test analysis
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "phishing-trap.xyz"}'

# View API docs
open http://localhost:8000/docs
```

## Troubleshooting

### Issue: "Supabase credentials not configured"
**Solution:** Ensure `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`

### Issue: "Connection refused"
**Solution:** 
- Check Supabase project is running
- Verify credentials are correct
- Check internet connectivity

### Issue: "Port 8000 already in use"
**Solution:**
```bash
# On Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Issue: CORS errors
**Solution:** Add your frontend URL to `origins` in `main.py`

## Performance

- Single URL analysis: ~50ms
- Bulk analysis (10 URLs): ~500ms
- Database operations: ~100-200ms
- Response time: <1s typical

## Security Notes

1. **Never commit `.env` to git** - It contains sensitive credentials
2. **Use HTTPS in production** - Don't send data over HTTP
3. **Validate all inputs** - Already done in `main.py`
4. **Rate limit API** - Prevent abuse (see config)
5. **Keep dependencies updated** - Run `pip install --upgrade -r requirements.txt`

## Contributing

To add new features:

1. Add endpoint to `main.py`
2. Add Pydantic models for request/response
3. Add logic to `analyzer.py` or `database.py`
4. Document in this README
5. Test with curl or Swagger UI at `/docs`

## Support

- **API Docs**: Visit `http://localhost:8000/docs`
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Supabase Docs**: https://supabase.com/docs

## License

MIT - Free to use and modify

---

**Happy Phishing Detection! 🎣🛡️**
