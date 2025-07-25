#!/usr/bin/env node

/**
 * Refresh All Users Data Script
 * 
 * This script refreshes GitHub contribution data and aura calculations
 * for all users in the database, updating both monthly and overall leaderboards.
 * 
 * Usage:
 * node scripts/refresh-all-users.js [options]
 * 
 * Options:
 * --batch-size=N    Process N users at a time (default: 5)
 * --delay=N         Delay between batches in milliseconds (default: 2000)
 * --dry-run         Show what would be done without making changes
 * --users=username1,username2  Only refresh specific users
 * --skip-ranks      Skip rank recalculation (faster)
 * --verbose         Show detailed logs
 */

const { PrismaClient } = require('@prisma/client');
// Note: Uses built-in fetch (Node.js 18+)

// Configuration
const CONFIG = {
  batchSize: 5,
  delay: 2000,
  dryRun: false,
  specificUsers: null,
  skipRanks: false,
  verbose: false,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  for (const arg of args) {
    if (arg.startsWith('--batch-size=')) {
      CONFIG.batchSize = parseInt(arg.split('=')[1]) || 5;
    } else if (arg.startsWith('--delay=')) {
      CONFIG.delay = parseInt(arg.split('=')[1]) || 2000;
    } else if (arg === '--dry-run') {
      CONFIG.dryRun = true;
    } else if (arg.startsWith('--users=')) {
      CONFIG.specificUsers = arg.split('=')[1].split(',').map(u => u.trim());
    } else if (arg === '--skip-ranks') {
      CONFIG.skipRanks = true;
    } else if (arg === '--verbose') {
      CONFIG.verbose = true;
    } else if (arg === '--help') {
      console.log(`
Refresh All Users Data Script

Usage: node scripts/refresh-all-users.js [options]

Options:
  --batch-size=N              Process N users at a time (default: 5)
  --delay=N                   Delay between batches in milliseconds (default: 2000)
  --dry-run                   Show what would be done without making changes
  --users=username1,username2  Only refresh specific users
  --skip-ranks                Skip rank recalculation (faster)
  --verbose                   Show detailed logs
  --help                      Show this help message

Examples:
  node scripts/refresh-all-users.js
  node scripts/refresh-all-users.js --batch-size=10 --delay=1000
  node scripts/refresh-all-users.js --users=octocat,github --verbose
  node scripts/refresh-all-users.js --dry-run
      `);
      process.exit(0);
    }
  }
}

// Initialize Prisma client
const prisma = new PrismaClient();

// Logging utility
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function verboseLog(message) {
  if (CONFIG.verbose) {
    log(message, 'info');
  }
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get current user data from database
async function getCurrentUserData(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalAura: true,
        currentStreak: true,
        longestStreak: true,
        lastContributionDate: true,
        globalLeaderboard: {
          select: {
            rank: true,
            totalAura: true
          }
        },
        monthlyLeaderboard: {
          select: {
            rank: true,
            totalAura: true,
            monthYear: true
          }
        }
      }
    });

    return user;
  } catch (error) {
    verboseLog(`Failed to get current data for user ${userId}: ${error.message}`);
    return null;
  }
}

// For dry run, get last contribution date to estimate if refresh is needed
async function analyzeUserForDryRun(user) {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const analysis = {
      hasRecentActivity: false,
      daysSinceLastContribution: null,
      needsRefresh: true,
      reason: 'GitHub data refresh would update aura calculations'
    };

    if (user.lastContributionDate) {
      const lastContrib = new Date(user.lastContributionDate);
      const diffInMs = now.getTime() - lastContrib.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      analysis.daysSinceLastContribution = diffInDays;
      analysis.hasRecentActivity = diffInDays <= 1;
      
      if (diffInDays === 0) {
        analysis.reason = 'Would fetch latest contributions for today';
      } else if (diffInDays === 1) {
        analysis.reason = `Would check for contributions from yesterday`;
      } else {
        analysis.reason = `Would check for new contributions (last: ${diffInDays} days ago)`;
      }
    } else {
      analysis.reason = 'No previous contribution data - would perform initial fetch';
    }

    return analysis;
  } catch (error) {
    verboseLog(`Error analyzing user: ${error.message}`);
    return {
      hasRecentActivity: false,
      daysSinceLastContribution: null,
      needsRefresh: true,
      reason: 'Error analyzing - refresh recommended'
    };
  }
}

// Generate dry run analysis for a user
function generateDryRunAnalysis(userData, analysis, username) {
  const info = [];
  
  if (!userData) {
    info.push('❓ Unable to analyze - user data not found');
    return info;
  }

  // Show current stats
  info.push(`📊 Current Total Aura: ${userData.totalAura || 0}`);
  info.push(`🔥 Current Streak: ${userData.currentStreak || 0} days`);
  info.push(`📈 Longest Streak: ${userData.longestStreak || 0} days`);
  
  // Show global rank if available
  if (userData.globalLeaderboard) {
    info.push(`🌍 Global Rank: #${userData.globalLeaderboard.rank}`);
  }
  
  // Show monthly rank if available
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyData = userData.monthlyLeaderboard?.find(m => m.monthYear === currentMonth);
  if (monthlyData) {
    info.push(`📅 Monthly Rank: #${monthlyData.rank}`);
  }
  
  // Show last contribution info
  if (userData.lastContributionDate) {
    const lastContrib = new Date(userData.lastContributionDate).toLocaleDateString();
    info.push(`📅 Last Contribution: ${lastContrib}`);
    
    if (analysis.daysSinceLastContribution !== null) {
      if (analysis.daysSinceLastContribution === 0) {
        info.push(`✅ Active today`);
      } else if (analysis.daysSinceLastContribution === 1) {
        info.push(`⚠️  Last active yesterday`);
      } else {
        info.push(`⏰ Last active ${analysis.daysSinceLastContribution} days ago`);
      }
    }
  } else {
    info.push(`❓ No previous contribution data`);
  }
  
  // Show what would happen
  info.push(`🔄 Action: ${analysis.reason}`);
  
  return info;
}

// Refresh a single user's data
async function refreshUser(user) {
  try {
    verboseLog(`Starting refresh for user: ${user.githubUsername} (${user.id})`);

    if (CONFIG.dryRun) {
      log(`[DRY RUN] Analyzing user: ${user.githubUsername}`, 'info');
      
      let changes = [];
      
      try {
        // Get current data from database
        const currentData = await getCurrentUserData(user.id);
        
        // Analyze what would happen during refresh
        const analysis = await analyzeUserForDryRun(user);
        
        // Generate analysis info
        const analysisInfo = generateDryRunAnalysis(currentData, analysis, user.githubUsername);
        
        // Show the analysis
        log(`📊 Analysis for ${user.githubUsername}:`, 'info');
        analysisInfo.forEach(info => {
          log(`   ${info}`, 'info');
        });
        
        changes = analysisInfo;
      } catch (error) {
        log(`❌ Error analyzing ${user.githubUsername}: ${error.message}`, 'error');
        changes = [`❌ Analysis failed: ${error.message}`];
      }
      
      return { success: true, user: user.githubUsername, changes: changes };
    }

    // Call the refresh API endpoint
    const response = await fetch(`${CONFIG.baseUrl}/api/refresh-user-aura`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user.githubUsername
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error from API');
    }

    verboseLog(`Successfully refreshed user: ${user.githubUsername}`);
    return { success: true, user: user.githubUsername, data: result };

  } catch (error) {
    log(`Failed to refresh user ${user.githubUsername}: ${error.message}`, 'error');
    return { success: false, user: user.githubUsername, error: error.message };
  }
}

// Recalculate all rankings
async function recalculateRanks() {
  try {
    if (CONFIG.dryRun) {
      log('[DRY RUN] Would recalculate all rankings', 'info');
      return { success: true };
    }

    log('Starting rank recalculation...', 'info');

    // Check if we have a cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      log('Warning: CRON_SECRET not set, skipping rank recalculation', 'warning');
      log('Set CRON_SECRET environment variable to enable rank updates', 'info');
      return { success: false, error: 'CRON_SECRET not configured' };
    }

    // Call the cron job endpoint to recalculate ranks
    const response = await fetch(`${CONFIG.baseUrl}/api/cron/update-ranks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update ranks');
    }

    log(`Ranks recalculated successfully! Monthly: ${result.monthlyUpdates}, Global: ${result.globalUpdates}`, 'success');
    return { success: true, data: result };

  } catch (error) {
    log(`Failed to recalculate ranks: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Get all users from database
async function getAllUsers() {
  try {
    let users;
    
    if (CONFIG.specificUsers) {
      verboseLog(`Fetching specific users: ${CONFIG.specificUsers.join(', ')}`);
      users = await prisma.user.findMany({
        where: {
          githubUsername: {
            in: CONFIG.specificUsers
          }
        },
        select: {
          id: true,
          githubUsername: true,
          displayName: true,
          totalAura: true,
          currentStreak: true,
          lastContributionDate: true
        }
      });
      
      // Check if all requested users were found
      const foundUsernames = users.map(u => u.githubUsername);
      const notFound = CONFIG.specificUsers.filter(u => !foundUsernames.includes(u));
      if (notFound.length > 0) {
        log(`Warning: Users not found: ${notFound.join(', ')}`, 'warning');
      }
    } else {
      verboseLog('Fetching all users from database...');
      users = await prisma.user.findMany({
        where: {
          githubUsername: {
            not: null
          }
        },
        select: {
          id: true,
          githubUsername: true,
          displayName: true,
          totalAura: true,
          currentStreak: true,
          lastContributionDate: true
        },
        orderBy: {
          totalAura: 'desc'
        }
      });
    }

    return users;
  } catch (error) {
    log(`Failed to fetch users: ${error.message}`, 'error');
    throw error;
  }
}

// Process users in batches
async function processUsersBatch(users, batchIndex) {
  const startIndex = batchIndex * CONFIG.batchSize;
  const endIndex = Math.min(startIndex + CONFIG.batchSize, users.length);
  const batch = users.slice(startIndex, endIndex);

  log(`Processing batch ${batchIndex + 1}: users ${startIndex + 1}-${endIndex} of ${users.length}`, 'info');

  const results = await Promise.all(
    batch.map(user => refreshUser(user))
  );

  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success).length;

  log(`Batch ${batchIndex + 1} completed: ${successes} successes, ${failures} failures`, 'info');

  // Log failures
  results.filter(r => !r.success).forEach(result => {
    log(`Failed: ${result.user} - ${result.error}`, 'error');
  });

  return results;
}

// Generate dry run summary
function generateDryRunSummary(allResults) {
  if (!CONFIG.dryRun) return;

  log('\n📋 DRY RUN SUMMARY', 'info');
  log('==================', 'info');

  const successfulAnalyses = allResults.filter(r => r.success);
  const failedAnalyses = allResults.filter(r => !r.success);

  log(`📊 Total users analyzed: ${allResults.length}`, 'info');
  log(`✅ Successful analyses: ${successfulAnalyses.length}`, 'info');
  log(`❌ Failed analyses: ${failedAnalyses.length}`, 'info');

  // Categorize users by their activity status
  const activeUsers = successfulAnalyses.filter(r => 
    r.changes && r.changes.some(c => c.includes('✅ Active today'))
  );
  
  const recentUsers = successfulAnalyses.filter(r => 
    r.changes && r.changes.some(c => c.includes('⚠️  Last active yesterday'))
  );
  
  const staleUsers = successfulAnalyses.filter(r => 
    r.changes && r.changes.some(c => c.includes('⏰ Last active'))
  );
  
  const newUsers = successfulAnalyses.filter(r => 
    r.changes && r.changes.some(c => c.includes('❓ No previous contribution data'))
  );

  log(`\n📈 ACTIVITY BREAKDOWN:`, 'info');
  log(`  🟢 Active today: ${activeUsers.length} users`, 'info');
  log(`  🟡 Active yesterday: ${recentUsers.length} users`, 'info');
  log(`  🟠 Inactive (2+ days): ${staleUsers.length} users`, 'info');
  log(`  🔵 New users (no data): ${newUsers.length} users`, 'info');

  if (activeUsers.length > 0) {
    log(`\n🟢 ACTIVE TODAY: ${activeUsers.map(r => r.user).join(', ')}`, 'info');
  }
  
  if (recentUsers.length > 0) {
    log(`\n🟡 ACTIVE YESTERDAY: ${recentUsers.map(r => r.user).join(', ')}`, 'info');
  }
  
  if (staleUsers.length > 0) {
    log(`\n🟠 INACTIVE USERS (sample): ${staleUsers.slice(0, 10).map(r => r.user).join(', ')}${staleUsers.length > 10 ? ` and ${staleUsers.length - 10} more...` : ''}`, 'info');
  }
  
  if (newUsers.length > 0) {
    log(`\n🔵 NEW USERS: ${newUsers.map(r => r.user).join(', ')}`, 'info');
  }

  if (failedAnalyses.length > 0) {
    log('\n❌ FAILED ANALYSES:', 'error');
    failedAnalyses.forEach(result => {
      log(`   ${result.user}: ${result.error}`, 'error');
    });
  }

  log('\n💡 RECOMMENDATION:', 'info');
  if (activeUsers.length > 0 || recentUsers.length > 0 || newUsers.length > 0) {
    log(`   ${activeUsers.length + recentUsers.length + newUsers.length} users likely have fresh data to process`, 'info');
    log(`   Run without --dry-run to refresh all user data`, 'info');
  } else {
    log(`   Most users appear to be inactive - refresh may not yield significant changes`, 'info');
    log(`   Consider running on specific active users: --users=username1,username2`, 'info');
  }
}

// Main execution function
async function main() {
  const startTime = Date.now();
  
  try {
    parseArgs();
    
    log('🚀 Starting GitAura data refresh for all users...', 'info');
    log(`Configuration: batch-size=${CONFIG.batchSize}, delay=${CONFIG.delay}ms, dry-run=${CONFIG.dryRun}`, 'info');

    // Get all users
    const users = await getAllUsers();
    log(`Found ${users.length} users to process`, 'info');

    if (users.length === 0) {
      log('No users found to process', 'warning');
      return;
    }

    // Process users in batches
    const totalBatches = Math.ceil(users.length / CONFIG.batchSize);
    const allResults = [];

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchResults = await processUsersBatch(users, batchIndex);
      allResults.push(...batchResults);

      // Add delay between batches (except for the last one)
      if (batchIndex < totalBatches - 1) {
        verboseLog(`Waiting ${CONFIG.delay}ms before next batch...`);
        await sleep(CONFIG.delay);
      }
    }

    // Calculate statistics
    const totalSuccess = allResults.filter(r => r.success).length;
    const totalFailures = allResults.filter(r => !r.success).length;

    log(`User data refresh completed: ${totalSuccess} successes, ${totalFailures} failures`, 'info');

    // Generate dry run summary
    if (CONFIG.dryRun) {
      generateDryRunSummary(allResults);
    }

    // Recalculate ranks if not skipped and not dry run
    if (!CONFIG.skipRanks && !CONFIG.dryRun) {
      log('Recalculating leaderboard rankings...', 'info');
      const rankResult = await recalculateRanks();
      
      if (!rankResult.success) {
        log('Rank recalculation failed, but user data was updated', 'warning');
        if (rankResult.error === 'CRON_SECRET not configured') {
          log('To enable rank updates, set the CRON_SECRET environment variable', 'info');
        }
      }
    } else if (CONFIG.dryRun) {
      log('Rank recalculation would run after data updates (use --skip-ranks to disable)', 'info');
    } else {
      log('Skipping rank recalculation (--skip-ranks flag)', 'info');
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log(`✅ Script completed in ${duration} seconds`, 'success');
    
    if (totalFailures > 0) {
      log(`⚠️ ${totalFailures} users failed to update. Check logs above for details.`, 'warning');
      process.exit(1);
    }

  } catch (error) {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  log('Script interrupted by user', 'warning');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('Script terminated', 'warning');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(async (error) => {
    log(`Unhandled error: ${error.message}`, 'error');
    await prisma.$disconnect();
    process.exit(1);
  });
}

module.exports = { main, refreshUser, recalculateRanks }; 