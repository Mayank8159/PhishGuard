# 🛡️ PhishGuard - Real-Time Phishing Detection App

**Advanced Mobile Security Solution for Detecting Phishing Links**

PhishGuard is a comprehensive React Native mobile application that provides real-time phishing detection and URL analysis. Using advanced web scraping, content analysis, and intelligent heuristics, PhishGuard protects users from phishing attacks, credential harvesting, and malicious websites.

---

## 📱 Features

### 🔍 **Real-Time URL Analysis**
- **Instant Threat Detection**: Analyze any URL in seconds to identify phishing attempts
- **Multi-Layer Analysis**: Combines URL inspection, web scraping, and content analysis
- **Risk Scoring**: Provides a 0-100 risk score with clear threat levels (Safe, Warning, Dangerous)

### 🧠 **Intelligent Detection System**

#### **URL-Based Detection**
- **Tunneling Service Detection**: Identifies ngrok, cloudflare, loca.lt, and other tunneling services (commonly used in phishing)
- **IP Address Detection**: Flags direct IP-based URLs instead of legitimate domains
- **Suspicious TLDs**: Detects risky top-level domains (.tk, .ml, .ga, .cf, .xyz, etc.)
- **Brand Impersonation**: Identifies fake PayPal, Amazon, Google, Microsoft sites
- **URL Structure Analysis**: Detects suspicious patterns like "@" symbols, multiple protocols, encoded traversal
- **Long Multi-Word Domains**: Catches domains designed to look legitimate through length

#### **Web Scraping & Content Analysis**
- **HTML Structure Analysis**: Examines page structure for phishing indicators
- **Form Detection**: Identifies suspicious login forms, especially on tunneling services
- **Credential Harvesting Detection**: Flags email/password input combinations
- **Brand Cloning Detection**: Compares page content against known brand patterns (Facebook, Instagram, Google, PayPal, Netflix, Microsoft, Apple, Amazon, Twitter, LinkedIn)
- **Suspicious JavaScript Detection**: Identifies obfuscated code (eval, atob, document.write)
- **Hidden Elements**: Detects hidden iframes and concealed content
- **Phishing Language**: Recognizes common social engineering phrases
- **External Resource Theft**: Catches sites loading content from legitimate brands while hosted elsewhere
- **Form Action Analysis**: Inspects where forms submit data

### 🛡️ **Active Protection**
- **Background Scanning**: Automatically scans URLs in the background when protection is enabled
- **Real-Time Monitoring**: Continuous protection against emerging threats
- **Persistent State**: Protection status syncs across app sessions and devices

### 📊 **Security Dashboard**
- **Threat Statistics**: Track threats blocked, safe sites visited, total scans
- **Scan History**: View all analyzed URLs with timestamps and risk scores
- **Recent Activity**: Quick access to recent scans for review
- **Visual Risk Indicators**: Color-coded threat levels (Green = Safe, Yellow = Warning, Red = Dangerous)

### 💾 **Offline-First Architecture**
- **Local Storage**: All scans stored locally for offline access
- **Background Sync**: Automatically syncs with backend when online
- **Graceful Degradation**: Full functionality even without internet connection

---

## 🏗️ Technical Architecture

### **Frontend (Mobile App)**
- **Framework**: React Native with Expo SDK 54.0.0
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local persistence
- **Icons**: Lucide React Native
- **Authentication**: Custom implementation with MongoDB backend

### **Backend (API Server)**
- **Framework**: FastAPI (Python)
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: Custom user management system
- **API Endpoints**: RESTful API for scans, stats, and user data

### **Detection Engine**
- **Primary Analysis**: Native JavaScript URL parsing and content inspection
- **Web Scraper**: Fetch API with HTML parsing for deep content analysis
- **Fallback System**: Local analysis when backend is unavailable
- **Real-Time Processing**: Instant analysis with sub-second response times

---

## 🔬 How It Works

### **1. URL Submission**
User enters a suspicious URL or pastes a link from messenger/email/text.

### **2. Multi-Stage Analysis**

#### **Stage 1: URL Inspection**
```
✓ Parse URL structure
✓ Check for tunneling services (ngrok, cloudflare tunnels)
✓ Detect IP addresses vs. domain names
✓ Analyze TLD (.tk, .ml, .xyz, etc.)
✓ Check for brand names in URL
✓ Inspect for suspicious patterns (@, .., multiple protocols)
✓ Measure domain length and complexity
```

#### **Stage 2: Web Scraping** (if URL is accessible)
```
✓ Fetch webpage content (with 8-second timeout)
✓ Extract page title
✓ Count forms on page
✓ Identify password input fields
✓ Detect email/username fields
✓ Count external links
✓ Scan JavaScript for obfuscation
```

#### **Stage 3: Content Analysis**
```
✓ Analyze form behavior (credential harvesting)
✓ Check for phishing phrases ("verify account", "urgent action")
✓ Compare page content to known brand patterns
✓ Detect stolen resources from legitimate sites
✓ Inspect form submission targets
✓ Look for hidden iframes
✓ Identify suspicious scripts
```

#### **Stage 4: Risk Calculation**
```
Risk Score = URL_Score + Content_Score

Thresholds:
  ≥ 50 points → 🔴 DANGEROUS
  25-49 points → 🟡 WARNING
  < 25 points → 🟢 SAFE

Threats listed in priority order
```

### **3. Result Presentation**
- **Visual Indicator**: Color-coded status badge
- **Risk Score**: 0-100 numerical score
- **Threat List**: Specific security issues detected
- **Timestamp**: When analysis was performed
- **History Tracking**: Scan saved for future reference

### **4. Data Persistence**
- **Local Storage**: Immediate save to AsyncStorage
- **Backend Sync**: Upload to MongoDB (when online)
- **Statistics Update**: Increment threat counters
- **Protection Logging**: Track background scans

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- npm or yarn
- Expo CLI
- Android Studio or Xcode (for emulators)
- MongoDB Atlas account (for backend)

### **Installation**

#### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/phishguard.git
cd phishguard
```

#### **2. Install Frontend Dependencies**
```bash
cd PhishGuard
npm install
```

#### **3. Configure Environment**
Create `.env` file in `PhishGuard` directory:
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
```

#### **4. Setup Backend**
```bash
cd ../backend
pip install -r requirements.txt
```

Create `.env` file in `backend` directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phishguard
```

Update `backend/database.py` with your MongoDB connection string.

#### **5. Run Backend**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

#### **6. Run Mobile App**
```bash
cd PhishGuard
npx expo start
```

Scan the QR code with Expo Go app on your phone, or:
- Press `a` for Android emulator
- Press `i` for iOS simulator

---

## 📱 Building APK

### **Using EAS Build**
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Build will be available at Expo dashboard after completion.

---

## 🛠️ Tech Stack

### **Mobile App**
| Technology | Purpose |
|------------|---------|
| React Native | Mobile framework |
| Expo SDK 54 | Development platform |
| TypeScript | Type-safe JavaScript |
| Expo Router | File-based navigation |
| AsyncStorage | Local data persistence |
| Lucide Icons | UI icons |
| React Native Reanimated | Animations |

### **Backend**
| Technology | Purpose |
|------------|---------|
| FastAPI | RESTful API framework |
| Python 3.10+ | Backend language |
| MongoDB Atlas | Cloud database |
| PyMongo | MongoDB driver |
| Uvicorn | ASGI server |

### **Detection Engine**
| Technology | Purpose |
|------------|---------|
| Fetch API | Web scraping |
| URL Parser | URL analysis |
| Regex Patterns | Pattern matching |
| HTML Parsing | Content extraction |

---

## 🔐 Security Features

### **Detection Capabilities**

#### **Phishing Patterns Detected:**
- ✅ Tunneling services (ngrok, cloudflare, loca.lt, etc.)
- ✅ IP-based URLs
- ✅ Suspicious TLDs
- ✅ Brand impersonation (PayPal, Amazon, Google, etc.)
- ✅ Credential harvesting forms
- ✅ Cloned brand pages
- ✅ Hidden iframes
- ✅ Obfuscated JavaScript
- ✅ Phishing language
- ✅ Lookalike domains
- ✅ Typosquatting
- ✅ Long multi-word domains
- ✅ Suspicious URL structures

#### **Risk Scoring Algorithm:**
```javascript
Base Score: 0

URL Analysis:
  + 50 points: Tunneling service
  + 20 points: Random subdomain pattern (3+ dashes)
  + 30 points: IP address
  + 15 points: No HTTPS
  + 20 points: Suspicious TLD
  + 18 points: Brand in hostname
  + 22 points: Phishing keywords in path
  + 25 points: @ symbol in URL
  + 20 points: Suspicious path structure
  + 15 points: Long URL/domain

Content Analysis (if accessible):
  + 25 points: Login form on tunneling service
  + 15 points: Credential harvesting form
  + 25 points: Suspicious JavaScript
  + 12 points: Excessive external links
  + 18 points: Hidden iframe
  + 20 points: Phishing phrases (2+)
  + 25 points: Brand cloning detected
  + 30 points: Stolen brand resources
  + 15 points: Suspicious form action

Total Score (capped at 100)
```

### **Privacy Protection**
- **No Personal Data Collection**: Only URLs are analyzed
- **Local-First**: All data stored locally by default
- **Optional Sync**: Backend sync only when user chooses
- **No Tracking**: No analytics or user tracking
- **Secure Communication**: HTTPS-only API calls

---

## 📊 API Endpoints

### **User Management**
```
POST   /signup          - Create new user account
POST   /signin          - User authentication
GET    /user/:id        - Get user profile
```

### **Threat Analysis**
```
POST   /analyze         - Analyze URL for threats
GET    /user/:id/scans  - Get user scan history
DELETE /user/:id/scans/:scanId - Delete specific scan
GET    /user/:id/stats  - Get security statistics
```

### **Protection**
```
GET    /user/:id/protection - Get protection status
POST   /user/:id/protection - Update protection status
POST   /user/:id/background-scan - Record background scan
```

### **System**
```
GET    /health          - API health check
```

---

## 🎯 Use Cases

### **Personal Use**
- Check suspicious emails before clicking links
- Verify social media links before visiting
- Scan SMS/WhatsApp links for phishing
- Protect from credential harvesting

### **Business Use**
- Employee security awareness training
- Corporate phishing simulation testing
- Security audit tool
- Brand protection monitoring

### **Educational Use**
- Cybersecurity education
- Phishing awareness demonstrations
- Security research
- Threat intelligence gathering

---

## 🗺️ Roadmap

### **v2.0 - Enhanced Detection**
- [ ] Machine learning-based detection
- [ ] Domain age checking
- [ ] SSL certificate validation
- [ ] WHOIS lookup integration
- [ ] Real-time blacklist checking

### **v2.1 - Advanced Features**
- [ ] Browser extension companion
- [ ] SMS/Message scanning
- [ ] QR code analysis
- [ ] Share to PhishGuard functionality
- [ ] Bulk URL scanning

### **v2.2 - Community Features**
- [ ] User reporting system
- [ ] Community threat database
- [ ] Trust score system
- [ ] Verified safe site whitelist

### **v3.0 - Enterprise Features**
- [ ] Team management
- [ ] Centralized dashboard
- [ ] API for integration
- [ ] Custom detection rules
- [ ] Detailed analytics

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Mayank Kumar Sharma**

---

## 🙏 Acknowledgments

- React Native & Expo teams for excellent mobile development tools
- FastAPI for high-performance Python API framework
- MongoDB Atlas for reliable cloud database hosting
- The cybersecurity community for threat intelligence

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: mayankfhacker@gmail.com

---

**⚠️ Disclaimer**: PhishGuard is a security tool designed to assist in identifying potential phishing threats. While it uses advanced detection methods, no system is 100% accurate. Always exercise caution when visiting unfamiliar websites and never enter sensitive information on untrusted sites.

**🛡️ Stay Safe Online!**

