import os
import json
import shutil
from datetime import datetime
from pathlib import Path

class BackupManager:
    def __init__(self, backup_dir="backups", max_backups=10):
        self.backup_dir = Path(backup_dir)
        self.max_backups = max_backups
        self.backup_dir.mkdir(exist_ok=True)
    
    def create_backup(self):
        """Create a new backup of bot configuration and data"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = self.backup_dir / f"backup_{timestamp}"
        backup_path.mkdir(exist_ok=True)

        try:
            # Backup .env file
            if os.path.exists(".env"):
                shutil.copy2(".env", backup_path / ".env")

            # Backup commands directory
            if os.path.exists("src/commands"):
                shutil.copytree("src/commands", backup_path / "commands", dirs_exist_ok=True)

            # Create backup manifest
            manifest = {
                "timestamp": timestamp,
                "backup_items": [".env", "commands"],
                "version": "1.0"
            }
            
            with open(backup_path / "manifest.json", "w") as f:
                json.dump(manifest, f, indent=2)

            self._rotate_backups()
            return True, f"Backup created successfully at {backup_path}"
        except Exception as e:
            return False, f"Backup failed: {str(e)}"

    def _rotate_backups(self):
        """Remove old backups if exceeding max_backups"""
        backups = sorted(list(self.backup_dir.glob("backup_*")))
        while len(backups) > self.max_backups:
            shutil.rmtree(backups[0])
            backups.pop(0)

    def list_backups(self):
        """List all available backups"""
        backups = []
        for backup_dir in self.backup_dir.glob("backup_*"):
            manifest_path = backup_dir / "manifest.json"
            if manifest_path.exists():
                with open(manifest_path) as f:
                    manifest = json.load(f)
                backups.append(manifest)
        return sorted(backups, key=lambda x: x["timestamp"], reverse=True)

def schedule_backup():
    """Function to be called periodically for creating backups"""
    backup_manager = BackupManager()
    success, message = backup_manager.create_backup()
    print(f"Backup status: {message}")
    return success
