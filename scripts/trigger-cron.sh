#!/bin/bash

# Set APP_URL and CRON_SECRET in your shell before running this script.
APP_URL="${APP_URL:-https://git-aura.karandev.in}"

if [ -z "$CRON_SECRET" ]; then
  echo "CRON_SECRET is required"
  exit 1
fi

echo "🚀 Triggering daily tasks (refresh users + update ranks)..."
curl -X POST "$APP_URL/api/cron/daily-tasks" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

echo -e "\n\n✅ Done!"
