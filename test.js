const { getContainers, getContainerStats, formatStats } = require('./src/docker')

async function main() {
  const containers = await getContainers()
  const rawStats = await getContainerStats(containers[0].Id)

  
  console.log(JSON.stringify(rawStats.memory_stats.usage, null, 2))
  const stats = formatStats(rawStats)
  
  console.log('Nome:', containers[0].Names[0])
  console.log('Memória:', stats.memory_mb, 'MB')
  console.log('CPU (%):', stats.cpu_percent)


}

main()