import fs from 'fs';
import express from 'express';
import { createServer } from 'https';
import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const server = createServer({
    key: fs.readFileSync('C:\\OSPanel\\userdata\\config\\cert_files\\server.key', 'utf8'),
    cert: fs.readFileSync('C:\\OSPanel\\userdata\\config\\cert_files\\server.crt', 'utf8')
}, app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

server.listen(process.env.SOCKET_PORT, process.env.SOCKET_HOST , () => {
    console.log('WebSocket Secure server running');
});
