# GitAura Data Refresh Scripts

This directory contains utility scripts for maintaining and refreshing GitAura data.

## refresh-all-users.js

A comprehensive script to refresh GitHub contribution data and aura calculations for all users in the database, updating both monthly and overall leaderboards.

### Features

- **Batch Processing**: Processes users in configurable batches to avoid overwhelming the GitHub API
- **Rate Limiting**: Configurable delays between batches to respect API limits
- **Selective Updates**: Target specific users or refresh all users
- **Dry Run Mode**: Test the script without making actual changes
- **Comprehensive Logging**: Detailed logs with timestamps and status indicators
- **Error Handling**: Graceful error handling with detailed error reporting
- **Rank Recalculation**: Automatically updates leaderboard rankings after data refresh
- **Progress Tracking**: Real-time progress tracking with batch completion status

### Installation

1. Make sure you have the required dependencies:
```bash
npm install @prisma/client
```
Note: This script uses Node.js built-in fetch (requires Node.js 18+)

2. Set up your environment variables:
```bash
# Required
DATABASE_URL="your_postgresql_connection_string"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # or your production URL

# Optional (for rank recalculation)
CRON_SECRET="your_cron_secret_key"
```

### Usage

#### Basic Commands

```bash
# Refresh all users (default settings)
node scripts/refresh-all-users.js

# Show help
node scripts/refresh-all-users.js --help

# Dry run to see what would happen
node scripts/refresh-all-users.js --dry-run

# Refresh specific users only
node scripts/refresh-all-users.js --users=octocat,github,torvalds

# Increase batch size and reduce delay for faster processing
node scripts/refresh-all-users.js --batch-size=10 --delay=1000

# Skip rank recalculation for faster execution
node scripts/refresh-all-users.js --skip-ranks

# Verbose logging for debugging
node scripts/refresh-all-users.js --verbose
```

#### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--batch-size=N` | Process N users at a time | 5 |
| `--delay=N` | Delay between batches in milliseconds | 2000 |
| `--dry-run` | Show what would be done without making changes | false |
| `--users=username1,username2` | Only refresh specific users | all users |
| `--skip-ranks` | Skip rank recalculation (faster) | false |
| `--verbose` | Show detailed logs | false |
| `--help` | Show help message | - |

### Examples

#### Production Data Refresh
```bash
# Conservative approach for production
node scripts/refresh-all-users.js --batch-size=3 --delay=3000 --verbose
```

#### Quick Development Refresh
```bash
# Fast refresh for development/testing
node scripts/refresh-all-users.js --batch-size=10 --delay=500 --skip-ranks
```

#### Specific User Troubleshooting
```bash
# Debug specific users
node scripts/refresh-all-users.js --users=problematic_user --verbose --dry-run
```

#### Large Scale Updates
```bash
# For databases with many users
node scripts/refresh-all-users.js --batch-size=8 --delay=1500
```

### What the Script Does

1. **Fetches all users** from the database (or specific users if specified)
2. **Processes users in batches** to avoid overwhelming the system
3. **For each user**:
   - Calls the `/api/refresh-user-aura` endpoint
   - Fetches fresh GitHub contribution data
   - Recalculates aura scores
   - Updates monthly and global leaderboards
4. **Recalculates rankings** across all leaderboards (unless skipped)
5. **Provides detailed reporting** on successes and failures

### Performance Considerations

- **GitHub API Limits**: The script includes delays to respect GitHub's API rate limits
- **Database Load**: Batch processing helps prevent database connection pool exhaustion
- **Memory Usage**: Users are processed in batches to manage memory consumption
- **Network Timeouts**: Each API call has appropriate timeout handling

### Error Handling

- **Network Errors**: Retries and detailed error reporting
- **Database Errors**: Graceful handling with transaction rollbacks
- **GitHub API Errors**: Specific error messages for API failures
- **User Not Found**: Clear reporting of missing users
- **Script Interruption**: Clean shutdown on CTRL+C

### Monitoring and Logging

The script provides detailed logging with:
- 🚀 Start/completion messages
- ℹ️ Information and progress updates
- ✅ Success confirmations
- ⚠️ Warnings for non-critical issues
- ❌ Error messages with details

### Integration

#### Cron Job Setup
```bash
# Add to crontab for daily refresh at 2 AM
0 2 * * * cd /path/to/gitaura && node scripts/refresh-all-users.js --batch-size=5 --delay=2000 >> logs/refresh.log 2>&1
```

#### CI/CD Integration
```yaml
# GitHub Actions example
- name: Refresh User Data
  run: |
    node scripts/refresh-all-users.js --batch-size=8 --delay=1000
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NEXT_PUBLIC_BASE_URL: ${{ secrets.BASE_URL }}
    CRON_SECRET: ${{ secrets.CRON_SECRET }}
```

### Troubleshooting

#### Common Issues

1. **"User not found" errors**: Check that GitHub usernames exist in the database
2. **API timeout errors**: Increase delay between batches or reduce batch size
3. **Database connection errors**: Check DATABASE_URL and connection limits
4. **Permission denied**: Ensure proper file permissions on the script

#### Debug Commands
```bash
# Test with a single user
node scripts/refresh-all-users.js --users=test_user --verbose --dry-run

# Check what users exist
node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findMany({select: {githubUsername: true}}).then(console.log)"
```

### Support

For issues or questions:
1. Check the logs for detailed error messages
2. Try running with `--verbose --dry-run` first
3. Test with a single user using `--users=username`
4. Verify your environment variables are set correctly 