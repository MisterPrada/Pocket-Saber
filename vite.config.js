import glsl from 'vite-plugin-glsl'
import basicSsl from '@vitejs/plugin-basic-ssl'
import dotenv from 'dotenv';
import fs from "fs";
dotenv.config();

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
    define: {
        __SOCKET_HOST__: `"${process.env.SOCKET_HOST}"`,
        __SOCKET_PORT__: `"${process.env.SOCKET_PORT}"`,
        __HANDSHAKE_HOST__: `"${process.env.HANDSHAKE_HOST}"`,
    },
    root: 'src/',
    publicDir: '../static/',
    base: './',
    server:
    {
        host: true,
        open: !isCodeSandbox, // Open if it's not a CodeSandbox
        https: {
            key: fs.readFileSync('C:\\OSPanel\\userdata\\config\\cert_files\\server.key', 'utf8'),
            cert: fs.readFileSync('C:\\OSPanel\\userdata\\config\\cert_files\\server.crt', 'utf8')
        },
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    plugins:
    [
        glsl()
    ]
}
