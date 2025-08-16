const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function refreshAllUsers() {
  try {
    console.log('Starting full user refresh...');
    
    // Get all users
    const users = await prisma.user.findMany({
      where: {
        isBanned: false,
        githubUsername: { not: null }
      },
      select: {
        id: true,
        githubUsername: true,
        displayName: true
      }
    });

    console.log(`Found ${users.length} users to refresh`);

    const batchSize = 5;
    const delayBetweenBatches = 2000; // 2 seconds
    const delayBetweenRequests = 500; // 0.5 seconds

    let successful = 0;
    let failed = 0;

    // Process in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(users.length / batchSize);
      
      console.log(`\n--- Processing batch ${batchNumber}/${totalBatches} ---`);

      for (const user of batch) {
        try {
          console.log(`Refreshing user: ${user.githubUsername}`);
          
          const response = await fetch(`http://localhost:3000/api/refresh-user-aura`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: user.githubUsername
            })
          });

          if (response.ok) {
            console.log(`✅ Successfully refreshed ${user.githubUsername}`);
            successful++;
          } else {
            const errorText = await response.text();
            console.log(`❌ Failed to refresh ${user.githubUsername}: ${response.status} - ${errorText}`);
            failed++;
          }

          // Small delay between individual requests
          await sleep(delayBetweenRequests);
        } catch (error) {
          console.log(`❌ Error refreshing ${user.githubUsername}:`, error.message);
          failed++;
        }
      }

      // Longer delay between batches
      if (i + batchSize < users.length) {
        console.log(`Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
        await sleep(delayBetweenBatches);
      }
    }

    console.log(`\n=== Refresh Summary ===`);
    console.log(`Total users: ${users.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((successful / users.length) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('Error in full refresh:', error);
  } finally {
    await prisma.$disconnect();
  }
}

refreshAllUsers();
