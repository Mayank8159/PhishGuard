"""
Database module for MongoDB operations
"""
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId

logger = logging.getLogger(__name__)


class Database:
    """MongoDB database operations wrapper"""
    
    def __init__(self, connection_string: str):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            self.db = self.client.phishguard
            self.users_collection = self.db.users
            self.scans_collection = self.db.scans
            self.is_connected_flag = self._test_connection()
        except Exception as e:
            logger.error(f"Failed to initialize MongoDB: {e}")
            self.is_connected_flag = False
    
    def _test_connection(self) -> bool:
        """Test if MongoDB is accessible"""
        try:
            self.client.admin.command('ping')
            logger.info("Connected to MongoDB Atlas")
            return True
        except Exception as e:
            logger.warning(f"Cannot connect to MongoDB: {e}")
            return False
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        if not self.is_connected_flag:
            self.is_connected_flag = self._test_connection()
        return self.is_connected_flag
    
    def insert_scan(
        self,
        user_id: str,
        url: str,
        status: str,
        risk_score: int,
        threats: List[str]
    ) -> Dict[str, Any]:
        """Insert a scan record"""
        try:
            scan_doc = {
                "user_id": user_id,
                "url": url,
                "status": status,
                "risk_score": risk_score,
                "threats": threats,
                "created": datetime.utcnow(),
                "timestamp": datetime.utcnow().isoformat()
            }
            result = self.scans_collection.insert_one(scan_doc)
            
            # Update user stats (create user if doesn't exist)
            self.users_collection.update_one(
                {"user_id": user_id},
                {
                    "$inc": {"total_scans": 1, "threats_blocked": 1 if status == "dangerous" else 0},
                    "$set": {"last_scan": datetime.utcnow()}
                },
                upsert=True
            )
            
            logger.info(f"Inserted scan for user {user_id}: {url} - {status}")
            
            return {
                "id": str(result.inserted_id),
                **scan_doc,
                "created": scan_doc["created"].isoformat()
            }
        except Exception as e:
            logger.error(f"Error inserting scan: {e}")
            return {}
    
    def get_user_scans(
        self,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get scan history for user"""
        try:
            scans = list(
                self.scans_collection.find(
                    {"user_id": user_id}
                )
                .sort("created", -1)
                .skip(offset)
                .limit(limit)
            )
            
            # Convert ObjectId to string for API response
            for scan in scans:
                scan["id"] = str(scan.pop("_id"))
                scan["timestamp"] = scan.get("created", datetime.utcnow()).isoformat()
            
            return scans
        except Exception as e:
            logger.error(f"Error fetching scans: {e}")
            return []
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            scans = list(self.scans_collection.find({"user_id": user_id}))
            
            stats = {
                "safe": 0,
                "warning": 0,
                "dangerous": 0,
                "total": len(scans)
            }
            
            for scan in scans:
                status = scan.get("status", "")
                if status in stats:
                    stats[status] += 1
            
            return stats
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
            return {"safe": 0, "warning": 0, "dangerous": 0, "total": 0}
    
    def delete_scan(self, scan_id: str, user_id: str) -> bool:
        """Delete a scan record"""
        try:
            # Verify the scan belongs to the user
            scan = self.scans_collection.find_one(
                {"_id": ObjectId(scan_id), "user_id": user_id}
            )
            
            if not scan:
                logger.warning(f"Unauthorized delete attempt for scan {scan_id}")
                return False
            
            # Delete the record
            result = self.scans_collection.delete_one(
                {"_id": ObjectId(scan_id)}
            )
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting scan: {e}")
            return False
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile"""
        try:
            user = self.users_collection.find_one({"user_id": user_id})
            if user:
                user["id"] = user.get("user_id", str(user.get("_id", "")))
                return user
            # Return empty profile with defaults if user not found
            return {
                "id": user_id,
                "email": "",
                "total_scans": 0,
                "threats_blocked": 0
            }
        except Exception as e:
            logger.error(f"Error fetching profile: {e}")
            return {}
    
    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile"""
        try:
            result = self.users_collection.update_one(
                {"user_id": user_id},
                {"$set": updates},
                upsert=True
            )
            return result.modified_count > 0 or result.matched_count > 0
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            return False
    
    def create_user(
        self,
        email: str,
        name: str,
        password_hash: str
    ) -> Dict[str, Any]:
        """Create a new user"""
        try:
            user_doc = {
                "email": email,
                "name": name,
                "password_hash": password_hash,
                "total_scans": 0,
                "threats_blocked": 0,
                "created": datetime.utcnow()
            }
            result = self.users_collection.insert_one(user_doc)
            return {
                "id": str(result.inserted_id),
                "email": email,
                "name": name
            }
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return {}
    
    def get_user_by_email(self, email: str) -> Dict[str, Any]:
        """Get user by email"""
        try:
            user = self.users_collection.find_one({"email": email})
            if user:
                user["id"] = str(user.pop("_id"))
                return user
            return {}
        except Exception as e:
            logger.error(f"Error fetching user by email: {e}")
            return {}
