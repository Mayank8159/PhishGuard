🛡️ PhishGuard AI (Mobile)
Zero-Day Phishing Detection in your Pocket
PhishGuard AI is a React Native Expo application designed for instant, on-the-go security triage. By leveraging Gemini 1.5 Flash’s Vision capabilities, the app captures live snapshots of suspicious links and identifies "Zero-Day" phishing attempts that standard mobile browsers miss.

📱 The Mobile Experience
Deepfake Detection: The app "sees" what you see. It detects pixel-perfect clones of login pages (Google, Instagram, Banks) using visual pattern matching.
Instant Share Analysis: Users can share a link from Safari or Chrome directly to PhishGuard to get an immediate verdict.
Haptic Feedback & Alerts: High-impact UI cues and haptics warn users of "Critical" risk levels.
🛠️ Mobile Tech Stack
Framework: Expo (SDK 50+)
UI/Styling: NativeWind (Tailwind for React Native)
Icons: lucide-react-native
Animations: react-native-reanimated (for the "Pulse" scan effect)
Data Viz: react-native-gifted-charts or react-native-progress (for Risk Gauges)
Navigation: Expo Router
🏗️ Technical Architecture
URL Submission: User inputs a URL or shares one from an external app.
Headless Processing: The app triggers a backend Node.js/Puppeteer service to visit the site (keeping the mobile device safe from malicious scripts).
Vision AI Triage: The backend sends a screenshot to Gemini 1.5 Flash.
Mobile Verdict: The app renders a "Threat Score Card" with specific flags (e.g., "Typosquatting Detected," "Non-Standard SSL").
🚦 Getting Started (Expo)
1. Prerequisites
Install Expo Go on your iOS or Android device.
A running instance of the PhishGuard Backend API.
2. Installation
# Clone the repository
git clone https://github.com/yourusername/phishguard-mobile

# Install dependencies
npm install

# Set up environment variables
# Create a .env file:
# EXPO_PUBLIC_API_URL=https://your-backend-api.com
3. Launch
npx expo start
Scan the QR code with your phone camera to open the app.

🛡️ Security Logic (The "Analyzer")
The app doesn't just check a list; it performs a Linguistic & Visual Audit:

Here is the paraphrased version:

Urgency Analysis: Identifies fear-based or panic-inducing messages such as “Your account will be removed in 2 hours” that try to pressure users into quick action.

Visual Fingerprinting: Compares the website’s favicon and CSS design elements with verified brand assets to check if the site is impersonating a legitimate organization.

Domain Entropy: Measures how random or suspicious a URL appears to detect automatically generated or potentially malicious domain names.

🗺️ Project Roadmap
 On-Device OCR: Local text scanning for faster triage.
 SMS Shield: Integration to scan phishing links directly from text messages.
 Community Blacklist: Reporting malicious URLs back to a global database.

