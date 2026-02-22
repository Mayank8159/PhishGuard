import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application Settings"""
    
    # API Configuration
    API_TITLE: str = "PhishGuard API"
    API_VERSION: str = "1.0.0"
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # PocketBase Configuration
    POCKETBASE_URL: Optional[str] = os.getenv("POCKETBASE_URL", "http://localhost:8090")
    POCKETBASE_ADMIN_EMAIL: Optional[str] = os.getenv("POCKETBASE_ADMIN_EMAIL", "admin@example.com")
    POCKETBASE_ADMIN_PASSWORD: Optional[str] = os.getenv("POCKETBASE_ADMIN_PASSWORD", "admin123456")
    
    # CORS Configuration
    CORS_ORIGINS: list = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "exp://localhost:8081",
        "exp://127.0.0.1:8081",
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Analysis Configuration
    MAX_THREATS_PER_URL: int = 3
    MAX_BULK_URLS: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
