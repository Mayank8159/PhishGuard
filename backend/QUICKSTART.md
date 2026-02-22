# PhishGuard Backend - Switched to PocketBase! 🎉

**📢 Major Update: We've switched from Supabase to PocketBase for COMPLETELY FREE database!**

✅ **Zero Cost** - No subscriptions, no hidden fees
✅ **Self-Hosted** - Full control of your data
✅ **Easy Setup** - Single executable, 5-minute setup
✅ **Same API** - Backend works exactly the same way

---

## What Changed?

| Feature | Supabase | PocketBase |
|---------|----------|-----------|
| **Cost** | $25/month+ | **FREE** |
| **Hosting** | Cloud/Managed | Self-hosted |
| **Setup Time** | 30 min (auth, projects, etc.) | **5 minutes** |
| **Local Development** | Need cloud account | **Runs on laptop** |
| **Scaling** | Pay for usage | **No limits** |

---

## ⚡ 5-Minute Quick Start

### Prerequisites

- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **PocketBase** - [Download](https://pocketbase.io)

### Step 1: Start PocketBase (1 min)

**Windows:**
Download from https://pocketbase.io, extract, then:
```bash
cd C:\path\to\pocketbase
pocketbase.exe serve
```

**macOS/Linux:**
```bash
cd ~/pocketbase
chmod +x pocketbase
./pocketbase serve
```

Open: http://127.0.0.1:8090/_/ → Create admin: `admin@example.com` / `admin123456`

### Step 2: Create Collections (2 min)

In PocketBase Admin Dashboard, create:

**Collection: `users`**
- id (auto)
- email, name, created_at, total_scans, threats_blocked

**Collection: `scans`**
- id (auto)
- user_id, url, status (select: safe/warning/dangerous), risk_score, threats, created

### Step 3: Run Backend (2 min)

```bash
cd backend
copy .env.example .env
pip install -r requirements.txt
python main.py
```

**Done! ✅** Backend running at http://localhost:8000

---

## 🧪 Test It

```bash
# Health check
curl http://localhost:8000/api/health

# Analyze URL
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "user_id": "test-user"}'
```

Or visit: http://localhost:8000/docs (Interactive API)

---

## 📱 Connect to React Native App

Edit `.env` in React Native project:
```
EXPO_PUBLIC_API_URL=http://<YOUR_IP>:8000/api
```

Find your IP:
- Windows: `ipconfig` → IPv4 Address
- macOS/Linux: `ifconfig` → inet address

---

## 📖 Full Details

- **[POCKETBASE_SETUP.md](POCKETBASE_SETUP.md)** ← READ THIS for detailed setup
- **[README.md](README.md)** ← API documentation

---

## Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/analyze` | Analyze single URL |
| `GET /api/health` | Check if running |
| `GET /api/user/{id}/stats` | Get user statistics |
| `GET /api/user/{id}/scans` | Get scan history |
| `DELETE /api/user/{id}/scans/{id}` | Delete scan |
| `GET /docs` | Interactive API docs |

---

## 🚀 Ready to Deploy?

See [POCKETBASE_SETUP.md](POCKETBASE_SETUP.md) → "Production Deployment" section

Options:
- **Railway.app** - Easiest (free tier)
- **Docker** - Most flexible
- **Self-hosted VPS** - Full control

---

## ❓ Common Issues

**"Cannot connect to PocketBase"**
→ Make sure PocketBase is running at http://localhost:8090

**"Phone can't reach backend API"**
→ Check your IP with `ipconfig`, use that in `.env`

**"Collections not found"**
→ Create them in PocketBase Admin Dashboard

More help: [POCKETBASE_SETUP.md](POCKETBASE_SETUP.md#troubleshooting)

---

## 💡 Why PocketBase?

- ✅ Developer-friendly
- ✅ Zero DevOps
- ✅ Perfect for startups
- ✅ Easy migration path
- ✅ Active community
- ✅ Open source

**Website:** https://pocketbase.io
