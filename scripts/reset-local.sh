#!/bin/bash
# Reset local Supabase database
# This will drop all data and reapply migrations

set -e

echo "🔄 Resetting local Supabase database..."

# Stop if running
supabase stop --no-backup 2>/dev/null || true

# Start fresh
supabase start

echo "✅ Local database reset complete!"
echo ""
echo "Studio UI: http://127.0.0.1:54323"
echo "API URL:   http://127.0.0.1:54321"
