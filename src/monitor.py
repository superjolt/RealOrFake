import os
import time
import requests
from twilio.rest import Client
from datetime import datetime

# Environment variables for Twilio
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER")
ALERT_PHONE_NUMBER = os.environ.get("ALERT_PHONE_NUMBER")

# Bot monitoring settings
BOT_URL = "http://localhost:3000"
CHECK_INTERVAL = 300  # Check every 5 minutes
MAX_RETRIES = 3
RETRY_DELAY = 60  # 1 minute between retries

def send_alert(message):
    """Send SMS alert using Twilio"""
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=ALERT_PHONE_NUMBER
        )
        print(f"Alert sent: {message}")
    except Exception as e:
        print(f"Failed to send alert: {e}")

def check_bot_health():
    """Check if the bot's web endpoint is responding"""
    try:
        response = requests.get(BOT_URL)
        return response.status_code == 200
    except:
        return False

def monitor_bot():
    """Main monitoring loop"""
    print("Starting Discord bot monitoring...")
    last_alert_time = None
    
    while True:
        is_healthy = False
        
        # Try multiple times before sending an alert
        for attempt in range(MAX_RETRIES):
            if check_bot_health():
                is_healthy = True
                break
            print(f"Health check failed, attempt {attempt + 1}/{MAX_RETRIES}")
            time.sleep(RETRY_DELAY)
        
        current_time = datetime.now()
        
        # If bot is down and we haven't sent an alert in the last hour
        if not is_healthy and (last_alert_time is None or 
            (current_time - last_alert_time).total_seconds() > 3600):
            alert_message = f"⚠️ Discord bot is DOWN! Last checked at {current_time.strftime('%Y-%m-%d %H:%M:%S')}"
            send_alert(alert_message)
            last_alert_time = current_time
        
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    # Verify environment variables
    required_vars = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", 
                    "TWILIO_PHONE_NUMBER", "ALERT_PHONE_NUMBER"]
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        print(f"Missing required environment variables: {', '.join(missing_vars)}")
        exit(1)
        
    monitor_bot()
