const express = require('express');
const {getContainers, getContainerStats, formatStats} = require('./docker')

const app = express();
const PORT = 3000;

app.get('/api/containers', async (req, res) => {
    try {
        const containers = await getContainers()
        const statsPromises = containers.map(async (container) => {
            const rawStats = await getContainerStats(container.Id)
            return {
                id: container.Id,
                name: container.Names[0].replace(/^\//, ''), // Remove leading slash
                stats: formatStats(rawStats)
            }
        })

        const containersWithStats = await Promise.all(statsPromises)
        res.json(containersWithStats)
    } catch (error) {
        console.error('Error fetching container data:', error)
        res.status(500).json({ error: 'Failed to fetch container data' })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})  