import glsl from 'vite-plugin-glsl'
import basicSsl from '@vitejs/plugin-basic-ssl'
import dotenv from 'dotenv';
dotenv.config();

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
    define: {
        __SOCKET_HOST__: `"${process.env.SOCKET_HOST}"`,
        __SOCKET_PORT__: `"${process.env.SOCKET_PORT}"`,
    },
    root: 'src/',
    publicDir: '../static/',
    base: './',
    server:
    {
        host: true,
        open: !isCodeSandbox, // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    plugins:
    [
        basicSsl(),
        glsl()
    ]
}
