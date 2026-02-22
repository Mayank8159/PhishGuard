"""
Database module for PocketBase operations
"""
from typing import Optional, List, Dict, Any
import logging
import requests

logger = logging.getLogger(__name__)


class Database:
    """PocketBase database operations wrapper"""
    
    def __init__(self, base_url: str):
        """Initialize with PocketBase URL"""
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.is_connected_flag = self._test_connection()
    
    def _test_connection(self) -> bool:
        """Test if PocketBase is accessible"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/health",
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Cannot connect to PocketBase: {e}")
            return False
    
    def is_connected(self) -> bool:
        """Check if database is connected (re-test each time)"""
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
            data = {
                "user_id": user_id,
                "url": url,
                "status": status,
                "risk_score": risk_score,
                "threats": ",".join(threats)  # PocketBase stores as string
            }
            response = self.session.post(
                f"{self.base_url}/api/collections/scans/records",
                json=data,
                timeout=10
            )
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"Error inserting scan: {response.text}")
                return {}
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
            # PocketBase filter syntax
            filter_query = f'user_id="{user_id}"'
            response = self.session.get(
                f"{self.base_url}/api/collections/scans/records",
                params={
                    "filter": filter_query,
                    "sort": "-created",
                    "limit": limit,
                    "skip": offset
                },
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("items", [])
            else:
                logger.error(f"Error fetching scans: {response.text}")
                return []
        except Exception as e:
            logger.error(f"Error fetching scans: {e}")
            return []
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            filter_query = f'user_id="{user_id}"'
            response = self.session.get(
                f"{self.base_url}/api/collections/scans/records",
                params={"filter": filter_query},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                scans = data.get("items", [])
                
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
            else:
                logger.error(f"Error fetching stats: {response.text}")
                return {"safe": 0, "warning": 0, "dangerous": 0, "total": 0}
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
            return {"safe": 0, "warning": 0, "dangerous": 0, "total": 0}
    
    def delete_scan(self, scan_id: str, user_id: str) -> bool:
        """Delete a scan record"""
        try:
            # First verify the scan belongs to the user
            response = self.session.get(
                f"{self.base_url}/api/collections/scans/records/{scan_id}",
                timeout=10
            )
            
            if response.status_code != 200:
                return False
            
            scan = response.json()
            if scan.get("user_id") != user_id:
                logger.warning(f"Unauthorized delete attempt for scan {scan_id}")
                return False
            
            # Delete the record
            delete_response = self.session.delete(
                f"{self.base_url}/api/collections/scans/records/{scan_id}",
                timeout=10
            )
            return delete_response.status_code in [200, 204]
        except Exception as e:
            logger.error(f"Error deleting scan: {e}")
            return False
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/collections/users/records/{user_id}",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error fetching profile: {response.text}")
                return {}
        except Exception as e:
            logger.error(f"Error fetching profile: {e}")
            return {}
    
    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile"""
        try:
            response = self.session.patch(
                f"{self.base_url}/api/collections/users/records/{user_id}",
                json=updates,
                timeout=10
            )
            return response.status_code in [200, 204]
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            return False
