#!/bin/bash

# Set your app URL and CRON secret
APP_URL="https://git-aura.karandev.in"  # Replace with your actual URL
CRON_SECRET="d5X5yiLGIkvZTPqO+GdtkGOzwpiSqXvT8b444CrZeF0="

echo "🚀 Triggering refresh all users..."
curl -X POST "$APP_URL/api/cron/refresh-all-users" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10, "delay": 2000}'

echo -e "\n\n⏳ Waiting 30 seconds before updating ranks..."
sleep 30

echo "📊 Updating ranks..."
curl -X POST "$APP_URL/api/cron/update-ranks" \
  -H "Authorization: Bearer $CRON_SECRET"

echo -e "\n\n✅ Done!"
