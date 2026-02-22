from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
from typing import Optional, List
import re
import logging
from database import Database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="PhishGuard API",
    description="Backend API for PhishGuard phishing detection app",
    version="1.0.0"
)

# CORS configuration - Allow all origins for mobile app compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://mayankfhacker:Sharma2005@cluster0.wjr2epg.mongodb.net/phishguard?retryWrites=true&w=majority")

if not MONGODB_URL:
    logger.warning("MongoDB URL not configured. Set MONGODB_URL")
    db: Optional[Database] = None
else:
    db: Optional[Database] = Database(MONGODB_URL)
    if db.is_connected():
        logger.info("Connected to MongoDB Atlas")
    else:
        logger.warning("Cannot connect to MongoDB Atlas")


# ===========================
# Pydantic Models
# ===========================

class AnalyzeRequest(BaseModel):
    url: str
    user_id: Optional[str] = None


class AnalyzeResponse(BaseModel):
    url: str
    status: str  # 'safe', 'warning', 'dangerous'
    riskScore: int
    threats: List[str]
    timestamp: str


class ScanHistoryItem(BaseModel):
    id: str
    url: str
    status: str
    created_at: str
    risk_score: Optional[int] = None


class SecurityStats(BaseModel):
    threats_blocked: int
    safe_sites: int
    scans_total: int
    protection_active: bool


class ProtectionStatusRequest(BaseModel):
    enabled: bool


class BackgroundScanRequest(BaseModel):
    count: int = 1


class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str]
    total_scans: int
    threats_blocked: int
    created_at: str


# ===========================
# Helper Functions
# ===========================

def analyze_threat(url: str) -> dict:
    """
    Perform local threat analysis on URL using heuristics.
    In production, integrate with:
    - Google Safe Browsing API
    - VirusTotal API
    - PhishTank API
    """
    url_lower = url.lower()
    risk_score = 0
    threats = []

    # Check for suspicious patterns
    suspicious_patterns = [
        ("bitly", 10, "URL shortener detected"),
        ("verify", 20, "Verification keyword"),
        ("confirm", 20, "Confirmation keyword"),
        ("urgent", 15, "Urgency keyword"),
        ("update", 15, "Update keyword"),
        ("click", 25, "Call-to-action keyword"),
        ("paypal", 15, "PayPal mimic"),
        ("amazon", 15, "Amazon mimic"),
        ("apple", 15, "Apple mimic"),
    ]

    for pattern, risk, threat_msg in suspicious_patterns:
        if pattern in url_lower:
            risk_score += risk
            if threat_msg not in threats:
                threats.append(threat_msg)

    # Check URL structure
    if ".." in url_lower or url_lower.count("//") > 1:
        risk_score += 25
        threats.append("Suspicious URL structure")

    # Check for HTTPS
    if not url_lower.startswith("https"):
        risk_score += 15
        threats.append("No HTTPS encryption")

    # Check for IP address
    ip_pattern = r"\d+\.\d+\.\d+\.\d+"
    if re.search(ip_pattern, url):
        risk_score += 30
        threats.append("Using IP address instead of domain")

    # Check for suspicious TLDs
    suspicious_tlds = [".tk", ".ml", ".ga", ".cf", ".xyz", ".top"]
    if any(url_lower.endswith(tld) for tld in suspicious_tlds):
        risk_score += 20
        threats.append("Suspicious top-level domain")

    # Check for credential harvesting patterns
    credential_patterns = ["login", "signin", "password", "verify-account"]
    if any(pattern in url_lower for pattern in credential_patterns):
        risk_score += 25
        threats.append("Credential harvesting detected")

    # Determine status
    risk_score = min(risk_score, 100)
    
    if risk_score >= 60:
        status = "dangerous"
    elif risk_score >= 30:
        status = "warning"
    else:
        status = "safe"

    return {
        "status": status,
        "riskScore": risk_score,
        "threats": threats[:3]  # Limit to 3 threats
    }


def validate_url(url: str) -> bool:
    """Validate URL format"""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    
    return bool(url_pattern.match(url))


# ===========================
# API Routes
# ===========================

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Check if API is running"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "database_connected": db is not None and db.is_connected()
    }


@app.post("/api/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
async def analyze_url(request: AnalyzeRequest):
    """Analyze URL for phishing threats"""
    try:
        # Validate URL
        if not request.url.strip():
            raise HTTPException(status_code=400, detail="URL is required")

        # Normalize URL
        url = request.url.strip()
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        if not validate_url(url):
            raise HTTPException(status_code=400, detail="Invalid URL format")

        # Perform analysis
        analysis = analyze_threat(url)
        timestamp = datetime.now().strftime("%I:%M %p")

        # Save to PocketBase if user_id provided
        if request.user_id and db and db.is_connected():
            try:
                db.insert_scan(
                    user_id=request.user_id,
                    url=url,
                    status=analysis["status"],
                    risk_score=analysis["riskScore"],
                    threats=analysis["threats"]
                )
                logger.info(f"Saved scan for user {request.user_id}: {url}")
            except Exception as db_error:
                logger.error(f"Database error: {db_error}")
                # Continue even if database save fails

        return AnalyzeResponse(
            url=url,
            status=analysis["status"],
            riskScore=analysis["riskScore"],
            threats=analysis["threats"],
            timestamp=timestamp
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/stats", response_model=SecurityStats, tags=["User"])
async def get_user_stats(user_id: str):
    """Get security statistics for a user"""
    try:
        if not db or not db.is_connected():
            # Return zeros if database not connected
            return SecurityStats(
                threats_blocked=0,
                safe_sites=0,
                scans_total=0,
                protection_active=True
            )

        # Get scan history from PocketBase
        stats_data = db.get_user_stats(user_id)

        total_scans = stats_data.get("total_scans", stats_data.get("total", 0))
        background_scans = stats_data.get("background_scans", 0)

        return SecurityStats(
            threats_blocked=stats_data.get("dangerous", 0),
            safe_sites=stats_data.get("safe", 0),
            scans_total=max(total_scans, stats_data.get("total", 0) + background_scans),
            protection_active=stats_data.get("protection_active", True)
        )

    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/protection", tags=["User"])
async def get_protection_status(user_id: str):
    """Get protection status"""
    try:
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        status = db.get_protection_status(user_id)
        if status is None:
            status = True

        return {"protection_active": status}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Protection status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/user/{user_id}/protection", tags=["User"])
async def update_protection_status(user_id: str, payload: ProtectionStatusRequest):
    """Update protection status"""
    try:
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        success = db.update_protection_status(user_id, payload.enabled)
        if success:
            return {"protection_active": payload.enabled}

        raise HTTPException(status_code=500, detail="Failed to update protection status")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Protection update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/user/{user_id}/background-scan", tags=["User"])
async def record_background_scan(user_id: str, payload: BackgroundScanRequest):
    """Record background scan count"""
    try:
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        count = payload.count if payload.count > 0 else 1
        success = db.increment_background_scans(user_id, count)
        if success:
            return {"message": "Background scan recorded", "count": count}

        raise HTTPException(status_code=500, detail="Failed to record background scan")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Background scan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/scans", response_model=List[ScanHistoryItem], tags=["User"])
async def get_user_scans(
    user_id: str,
    limit: int = 10,
    offset: int = 0
):
    """Get scan history for a user"""
    try:
        if not db or not db.is_connected():
            return []

        data = db.get_user_scans(user_id, limit, offset)
        
        scans = [
            ScanHistoryItem(
                id=scan["id"],
                url=scan["url"],
                status=scan["status"],
                created_at=scan.get("timestamp", ""),
                risk_score=scan.get("risk_score")
            )
            for scan in data
        ]

        return scans

    except Exception as e:
        logger.error(f"Scans error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/user/{user_id}/scans/{scan_id}", tags=["User"])
async def delete_scan(user_id: str, scan_id: str):
    """Delete a scan record"""
    try:
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        success = db.delete_scan(scan_id, user_id)
        if success:
            return {"message": "Scan deleted"}
        else:
            raise HTTPException(status_code=404, detail="Scan not found or unauthorized")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/profile", response_model=UserProfile, tags=["User"])
async def get_user_profile(user_id: str):
    """Get user profile"""
    try:
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        user_data = db.get_user_profile(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserProfile(
            id=user_data.get("id", user_id),
            email=user_data.get("email", ""),
            name=user_data.get("name"),
            total_scans=user_data.get("total_scans", 0),
            threats_blocked=user_data.get("threats_blocked", 0),
            created_at=user_data.get("created", "")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/user/{user_id}/profile", tags=["User"])
async def update_user_profile(user_id: str, name: Optional[str] = None):
    """Update user profile"""
    try:
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        update_data = {}
        if name:
            update_data["name"] = name

        success = db.update_user_profile(user_id, update_data)
        if success:
            return {"message": "Profile updated"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update profile")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/bulk-analyze", tags=["Analysis"])
async def bulk_analyze(urls: str, user_id: Optional[str] = None):
    """Analyze multiple URLs at once"""
    try:
        url_list = [u.strip() for u in urls.split(",") if u.strip()]
        
        if not url_list or len(url_list) > 10:
            raise HTTPException(
                status_code=400,
                detail="Provide 1-10 URLs separated by commas"
            )

        results = []
        for url in url_list:
            if validate_url(url):
                analysis = analyze_threat(url)
                results.append({
                    "url": url,
                    "status": analysis["status"],
                    "riskScore": analysis["riskScore"],
                    "threats": analysis["threats"]
                })

        return {"results": results}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/", tags=["Root"])
async def root():
    """API Documentation"""
    return {
        "message": "PhishGuard API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "GET /api/health",
            "analyze": "POST /api/analyze",
            "bulk_analyze": "GET /api/bulk-analyze",
            "stats": "GET /api/user/{user_id}/stats",
            "scans": "GET /api/user/{user_id}/scans",
            "delete_scan": "DELETE /api/user/{user_id}/scans/{scan_id}",
            "profile": "GET /api/user/{user_id}/profile",
            "update_profile": "POST /api/user/{user_id}/profile"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
