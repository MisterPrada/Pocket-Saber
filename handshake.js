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

// Хранение соединений клиентов
const sessions = {};

wss.on('connection', (ws) => {

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'CREATE_SESSION':
                // Создание новой сессии с уникальным handshakeId
                if (data.handshakeId) {
                    sessions[data.handshakeId] = { desktop: ws }; // Сохраняем WebSocket текущего клиента как первого участника сессии
                    ws.send(JSON.stringify({ type: 'SESSION_CREATED', handshakeId: data.handshakeId }));
                }
                break;
            case 'JOIN_SESSION':
                // Присоединение к существующей сессии с handshakeId
                if (data.handshakeId && sessions[data.handshakeId]) {
                    sessions[data.handshakeId].mobile = ws; // Добавляем этот WebSocket в сессию
                    ws.send(JSON.stringify({ type: 'SESSION_JOINED', handshakeId: data.handshakeId }));

                    // Уведомляем desktop
                    sessions[data.handshakeId].desktop.send(JSON.stringify({ type: 'SESSION_JOINED', handshakeId: data.handshakeId }));
                }
                break;

            case 'OFFER':
                // Получаем оффер от инициатора, сохраняем WebSocket инициатора и пересылаем оффер мобильному клиенту
                const session = sessions[data.handshakeId];
                if (session && session.mobile) {
                    //session.desktop = ws; // Сохраняем WebSocket инициатора
                    session.mobile.send(JSON.stringify({ type: 'OFFER', sdp: data.sdp })); // Пересылаем оффер мобильному клиенту
                }
                break;

            case 'ANSWER':
                // Получаем ответ от мобильного клиента, пересылаем его инициатору
                const sessionForAnswer = sessions[data.handshakeId];
                if (sessionForAnswer && sessionForAnswer.desktop) {
                    sessionForAnswer.desktop.send(JSON.stringify({ type: 'ANSWER', sdp: data.sdp })); // Пересылаем ответ инициатору
                }
                break;

            case 'ICE_CANDIDATE':
                // Получаем ICE candidate и пересылаем его другой стороне
                const sessionForCandidate = sessions[data.handshakeId];
                if (sessionForCandidate) {
                    // Определяем, куда следует отправить ICE candidate
                    const targetWs = (sessionForCandidate.desktop === ws) ? sessionForCandidate.mobile : sessionForCandidate.desktop;

                    if (targetWs) {
                        targetWs.send(JSON.stringify({ type: 'ICE_CANDIDATE', candidate: data.candidate }));
                    }
                }
                break;
            default:
                console.warn(`Unsupported message type: ${data.type}`);
        }
    });

    ws.on('close', () => {
        // Находим и удаляем сессию, связанную с закрытым WebSocket
        for (const [handshakeId, session] of Object.entries(sessions)) {
            if (session.mobile === ws || session.desktop === ws) {
                console.log(`Client disconnected: ${handshakeId}`);
                delete sessions[handshakeId];
                break;
            }
        }
    });
});

const PORT = process.env.SOCKET_PORT || 3033;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// wss.on('connection', (ws) => {
//     ws.on('message', (message) => {
//         wss.clients.forEach(client => {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 client.send(message.toString());
//             }
//         });
//     });
// });
//
// server.listen(process.env.SOCKET_PORT, process.env.SOCKET_HOST , () => {
//     console.log('WebSocket Secure server running');
// });
