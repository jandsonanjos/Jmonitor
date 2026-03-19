const express = require('express');
const {getContainers, getContainerStats, formatStats} = require('./docker')
const http = require('http');
const WebSocket = require('ws');
const app = express();
const PORT = 3000;

app.use(express.static('public'))
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

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket')

    const sendStats = async () => {
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
            ws.send(JSON.stringify(containersWithStats))
        } catch (error) {
            console.error('Error fetching container data:', error)
        }
    }
          const interval = setInterval(sendStats, 2000)
          sendStats() // envia imediatamente na conexão, sem esperar 2s
          ws.on('close', () => {
                clearInterval(interval)
                console.log('Client disconnected')
    })   

})
    server.listen(PORT, () => {
        console.log(`Monitor rodando em http://localhost:${PORT}`)
})
