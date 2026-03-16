const axios = require('axios')

const DOCKER_OPTS = { socketPath: '/var/run/docker.sock' }

async function getContainers() {
  const response = await axios.get('http://localhost/containers/json', DOCKER_OPTS)
  return response.data
}

async function getContainerStats(containerId) {
  const response = await axios.get(
    `http://localhost/containers/${containerId}/stats?stream=false`,
    DOCKER_OPTS
  )
  return response.data
}


function formatStats(rawStats) {
    const cpuDelta = rawStats.cpu_stats.cpu_usage.total_usage - rawStats.precpu_stats.cpu_usage.total_usage
    const sysDelta = rawStats.cpu_stats.system_cpu_usage - rawStats.precpu_stats.system_cpu_usage
    const cores = rawStats.cpu_stats.online_cpus || rawStats.cpu_stats.cpu_usage.percpu_usage.length

    const cpu_percent = (cpuDelta / sysDelta) * cores * 100

    return{
        memory_mb: Math.round(rawStats.memory_stats.usage / 1024 / 1024 * 100) / 100, //container convertendo para MB,
        cpu_percent: Math.round(cpu_percent * 100) / 100
    }
}


module.exports = { getContainers, getContainerStats, formatStats }