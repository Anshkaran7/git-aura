#!/bin/bash

# Set your app URL and CRON secret
APP_URL="https://git-aura.karandev.in"  # Replace with your actual URL
CRON_SECRET="Yvs+JMxI/Xyip3ZcVh4GiECXowz+4FNBB7chjpIN2lE="

echo "🚀 Triggering daily tasks (refresh users + update ranks)..."
curl -X POST "$APP_URL/api/cron/daily-tasks" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

echo -e "\n\n✅ Done!"
