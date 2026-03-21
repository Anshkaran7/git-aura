

async function generatePastWinners() {
  const months = ["2025-11", "2025-12", "2026-01", "2026-02", "2026-03"];
  const cronSecret = "Yvs+JMxI/Xyip3ZcVh4GiECXowz+4FNBB7chjpIN2lE=";
  
  console.log("🚀 Starting generation of past monthly winners...");

  for (const monthYear of months) {
    try {
      console.log(`\n⏳ Processing ${monthYear}...`);
      const response = await fetch("http://localhost:3000/api/save-monthly-winners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cronSecret}`
        },
        body: JSON.stringify({ monthYear })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error(`❌ Failed for ${monthYear}:`, data);
      } else {
        console.log(`✅ Success for ${monthYear}:`, data.message || "Done");
        if (data.winners) {
          data.winners.forEach(w => console.log(`   🏆 #${w.rank}: ${w.user.githubUsername} (${w.totalAura} Aura)`));
        }
      }
    } catch (error) {
      console.error(`❌ Error processsing ${monthYear}:`, error.message);
    }
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("\n✨ Finished generating past winners!");
}

generatePastWinners();
