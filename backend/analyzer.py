"""
Threat analysis module with multiple detection engines
"""
import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class ThreatAnalyzer:
    """Main threat analysis engine"""
    
    # Suspicious patterns (pattern, risk_score, threat_message)
    SUSPICIOUS_PATTERNS: List[Tuple[str, int, str]] = [
        ("bitly", 10, "URL shortener detected"),
        ("verify", 20, "Verification keyword"),
        ("confirm", 20, "Confirmation keyword"),
        ("urgent", 15, "Urgency keyword"),
        ("update", 15, "Update keyword"),
        ("click", 25, "Call-to-action keyword"),
        ("paypal", 15, "PayPal mimic"),
        ("amazon", 15, "Amazon mimic"),
        ("apple", 15, "Apple mimic"),
        ("microsoft", 15, "Microsoft mimic"),
        ("google", 15, "Google mimic"),
        ("bank", 20, "Banking keyword"),
        ("account", 18, "Account keyword"),
        ("security", 10, "Security keyword"),
        ("alert", 18, "Alert keyword"),
    ]
    
    SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".xyz", ".top", ".download"]
    
    CREDENTIAL_PATTERNS = ["login", "signin", "password", "verify-account", "reset"]
    
    @staticmethod
    def analyze(url: str) -> Dict:
        """Perform comprehensive threat analysis"""
        url_lower = url.lower()
        risk_score = 0
        threats = []
        
        # Check all detection methods
        ThreatAnalyzer._check_patterns(url_lower, risk_score, threats)
        ThreatAnalyzer._check_structure(url_lower, risk_score, threats)
        ThreatAnalyzer._check_protocol(url_lower, risk_score, threats)
        ThreatAnalyzer._check_ip_address(url, risk_score, threats)
        ThreatAnalyzer._check_tld(url_lower, risk_score, threats)
        ThreatAnalyzer._check_credential_harvesting(url_lower, risk_score, threats)
        ThreatAnalyzer._check_homograph_attack(url, risk_score, threats)
        
        # Cap score at 100
        risk_score = min(risk_score, 100)
        
        # Determine status
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
    
    @staticmethod
    def _check_patterns(url: str, risk_score: int, threats: List[str]):
        """Check for suspicious patterns"""
        for pattern, risk, threat_msg in ThreatAnalyzer.SUSPICIOUS_PATTERNS:
            if pattern in url:
                risk_score += risk
                if threat_msg not in threats:
                    threats.append(threat_msg)
    
    @staticmethod
    def _check_structure(url: str, risk_score: int, threats: List[str]):
        """Check URL structure"""
        if ".." in url:
            risk_score += 25
            threats.append("Suspicious URL structure")
        
        if url.count("//") > 1:
            risk_score += 20
            threats.append("Double slash detected")
    
    @staticmethod
    def _check_protocol(url: str, risk_score: int, threats: List[str]):
        """Check for HTTPS"""
        if not url.startswith("https"):
            risk_score += 15
            threats.append("No HTTPS encryption")
    
    @staticmethod
    def _check_ip_address(url: str, risk_score: int, threats: List[str]):
        """Check for IP address instead of domain"""
        ip_pattern = r"\d+\.\d+\.\d+\.\d+"
        if re.search(ip_pattern, url):
            risk_score += 30
            threats.append("Using IP address instead of domain")
    
    @staticmethod
    def _check_tld(url: str, risk_score: int, threats: List[str]):
        """Check for suspicious TLDs"""
        if any(url.endswith(tld) for tld in ThreatAnalyzer.SUSPICIOUS_TLDS):
            risk_score += 20
            threats.append("Suspicious top-level domain")
    
    @staticmethod
    def _check_credential_harvesting(url: str, risk_score: int, threats: List[str]):
        """Check for credential harvesting patterns"""
        if any(pattern in url for pattern in ThreatAnalyzer.CREDENTIAL_PATTERNS):
            risk_score += 25
            threats.append("Credential harvesting pattern")
    
    @staticmethod
    def _check_homograph_attack(url: str, risk_score: int, threats: List[str]):
        """Check for homograph attacks (character substitution)"""
        # Check for common character substitutions
        homograph_patterns = [
            (r"0", "o"),  # Zero and O
            (r"l", "1"),  # l and 1
        ]
        
        domain = url.split("/")[2] if "//" in url else url
        if domain.count("0") > 2 or domain.count("1") > 2:
            risk_score += 20
            threats.append("Possible homograph attack")
