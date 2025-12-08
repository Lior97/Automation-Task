const http = require('http');

const PORT = Number(process.env.PORT) || 3000;

const sendJson = (res, statusCode, payload) => {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(payload, null, 2));
};

const routes = {
    GET: {
        '/':       () => ({ message: 'Hello', endpoints: ['/status', '/health'] }),
        '/status': () => ({ status: 'ok', service: 'assignment', timestamp: new Date().toISOString() }),
        '/health': () => ({ healthy: true }),
    },
};

const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, `https://${req.headers.host}`).pathname;
    const handler = routes[req.method]?.[pathname];

    if (handler) {
        return sendJson(res, 200, handler());
    }


    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        return res.end();
    }

    sendJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
    console.log(`Server ready: http://localhost:${PORT}`);
    console.log(`Status:       http://localhost:${PORT}/status`);
    console.log(`Health:       http://localhost:${PORT}/health`);
});

const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
