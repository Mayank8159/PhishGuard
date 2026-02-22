# PocketBase Setup Guide for PhishGuard

**PocketBase is a completely free, self-hosted backend** - no cloud costs, no subscriptions!

## What is PocketBase?

PocketBase is a modern open-source backend for your next SaaS application with:
- ✅ **Completely Free** - No costs, no limits
- ✅ **Self-Hosted** - Run on your own server or laptop
- ✅ **Built-in Admin UI** - Manage data visually
- ✅ **Real-time Database** - SQLite + REST API
- ✅ **Authentication** - Built-in users & auth
- ✅ **Easy Deployment** - Single executable file

**Download:** https://pocketbase.io

---

## 📋 Quick Setup (5 minutes)

### Step 1: Download PocketBase

1. Go to https://pocketbase.io/
2. Download the latest release for your OS:
   - **Windows**: `pocketbase_windows_amd64.zip`
   - **macOS**: `pocketbase_darwin_amd64.zip` or `pocketbase_darwin_arm64.zip`
   - **Linux**: `pocketbase_linux_amd64.zip`

3. Extract to a folder (e.g., `C:\pocketbase\` or `~/pocketbase/`)

### Step 2: Start PocketBase

**Windows:**
```bash
cd C:\pocketbase
.\pocketbase.exe serve
```

**macOS/Linux:**
```bash
cd ~/pocketbase
chmod +x pocketbase
./pocketbase serve
```

**Expected output:**
```
 ▄███████▄     _____  ███████████
 ███▀   ███    ███   ███░░░░░███  PocketBase 0.21.x
 ███    ███   ███    ███    ███   Powered by Golang
█████████████████   ███    ███   
 ███    ███   ███    ███    ███   
 ███▀   ███    ███   ███░░░░░███  https://pocketbase.io
 ▀███████▀     ███   ███████████  
                                  
Server started at: http://127.0.0.1:8090
Admin dashboard: http://127.0.0.1:8090/_/
```

### Step 3: Create Admin Account

1. Open http://127.0.0.1:8090/_/ in your browser
2. Create admin account:
   - Email: `admin@example.com`
   - Password: `admin123456` (change this!)

### Step 4: Create Collections

In the Admin Dashboard, create these collections:

#### Collection 1: `users`
**Fields:**
- `id` (auto-generated)
- `email` (text, unique)
- `name` (text)
- `created_at` (datetime)
- `total_scans` (number)
- `threats_blocked` (number)

#### Collection 2: `scans`
**Fields:**
- `id` (auto-generated)
- `user_id` (text, required - link to users)
- `url` (text, required)
- `status` (select: safe, warning, dangerous)
- `risk_score` (number, 0-100)
- `threats` (text - comma-separated)
- `created` (datetime, auto)

### Step 5: Configure Backend

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```
POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=admin123456
API_PORT=8000
DEBUG=True
```

### Step 6: Install Dependencies & Run Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py
```

**Expected output:**
```
INFO:     Connected to PocketBase at http://localhost:8090
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🧪 Test the Setup

### Test 1: Health Check
```bash
curl http://localhost:8000/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-02-21T...",
  "database_connected": true
}
```

### Test 2: Analyze URL
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "user_id": "test-user-1"}'
```

**Expected:**
```json
{
  "url": "https://google.com",
  "status": "safe",
  "riskScore": 0,
  "threats": [],
  "timestamp": "02:30 PM"
}
```

### Test 3: Check Data in PocketBase

1. Go to Admin Dashboard: http://127.0.0.1:8090/_/
2. Click on "scans" collection
3. You should see your test scan!

---

## 📱 Connect Your React Native App

Edit `.env` in your React Native project:

```
EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:8000/api
```

**Find your IP:**
- Windows: `ipconfig` → Look for IPv4
- macOS/Linux: `ifconfig` → Look for inet

**Example:**
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

Restart your app: Press `r` in Expo CLI

---

## 🚀 Production Deployment

### Option 1: Deploy to Railway (Recommended)

Railway provides free tier for small projects!

1. Push your backend code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select your PhishGuard repo
5. Add environment variables:
   - POCKETBASE_URL (your Railway PocketBase app URL)
   - POCKETBASE_ADMIN_EMAIL
   - POCKETBASE_ADMIN_PASSWORD

### Option 2: Deploy PocketBase to Railway

1. Create a `Dockerfile` for PocketBase:
```dockerfile
FROM alpine:3.18

RUN apk add --no-cache unzip ca-certificates

WORKDIR /pb

RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.0/pocketbase_0.21.0_linux_amd64.zip
RUN unzip pocketbase_0.21.0_linux_amd64.zip
RUN chmod +x /pb/pocketbase

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
```

2. Push to Railway
3. Set port to `8090`

### Option 3: Deploy Everything to Docker

```bash
# Build API container
docker build -t phishguard-api .

# Start both services
docker-compose up
```

Then update your `.env`:
```
POCKETBASE_URL=http://pocketbase:8090
```

---

## 📊 Backup & Restore

### Backup PocketBase Data

Data is stored in a SQLite file:

**Windows:**
```bash
copy pb_data\pb.db pb_data\pb.db.backup
```

**macOS/Linux:**
```bash
cp pb_data/pb.db pb_data/pb.db.backup
```

### Restore from Backup

Simply copy the backup back:

**Windows:**
```bash
copy pb_data\pb.db.backup pb_data\pb.db
```

**macOS/Linux:**
```bash
cp pb_data/pb.db.backup pb_data/pb.db
```

---

## 🔐 Security Tips

1. **Change admin password** immediately:
   - Go to Admin Dashboard
   - Settings → Admin accounts
   - Change from default `admin123456`

2. **Enable API authentication** rules (optional):
   - Go to Collections → scans
   - Click "API Requests"
   - Set custom rules (e.g., only own records)

3. **Enable HTTPS** in production:
   - Use a reverse proxy (Nginx)
   - Or deploy to Railway/Railway (auto HTTPS)

4. **Regular backups**:
   - Backup `pb_data/pb.db` regularly
   - Store in secure location

---

## 🐛 Troubleshooting

### PocketBase won't start
```bash
# Try different port
./pocketbase serve --http=0.0.0.0:8091
```

### Can't connect from React Native
1. Check computer IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
2. Ensure phone and computer are on **same WiFi**
3. Update `EXPO_PUBLIC_API_URL` with correct IP
4. Check Windows Firewall allows port 8000

### Database connection error
1. Make sure PocketBase is running: `http://localhost:8090`
2. Check `.env` has correct `POCKETBASE_URL`
3. Check admin credentials in `.env`

### No data showing in PocketBase
1. Go to Admin Dashboard: http://127.0.0.1:8090/_/
2. Check if `scans` collection exists
3. Check collection has right fields
4. Try submitting a test request again

---

## 📚 Learn More

- **PocketBase Docs:** https://pocketbase.io/docs/
- **PocketBase API Guide:** https://pocketbase.io/docs/api/
- **REST API Reference:** https://pocketbase.io/docs/api/records/
- **JavaScript SDK:** https://github.com/pocketbase/js-sdk

---

## 🎯 Next Steps

1. ✅ PocketBase running locally
2. ✅ Backend connected to PocketBase
3. ✅ React Native app connected to backend
4. 🔜 Deploy to production when ready
5. 🔜 Monitor usage and scale as needed

**Total cost: $0 🎉**

---

## Quick Command Reference

```bash
# Start PocketBase
./pocketbase serve

# Start Backend API
python main.py

# Test API
curl http://localhost:8000/api/health

# Run tests
python test_api.py

# Backup data
cp pb_data/pb.db pb_data/pb.db.backup

# Clear all data (WARNING!)
rm -rf pb_data

# Change admin password
# Use Admin Dashboard: http://localhost:8090/_/
```

---

**Happy coding! 🚀**
