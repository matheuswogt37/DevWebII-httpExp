const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

let qtdProductPolling = 32;
const webSocketClients = new Set();
let qtdProduct = 24;

// http polling
app.get("/polling", (req, res) => {
    console.log(`[HTTP Polling] Enviando a quantidade ${qtdProductPolling}`);
    res.json({ qtdProductPolling });
});

app.post("/polling/buy", (req, res) => {
    qtdProductPolling--;
    console.log(`[HTTP Polling] Atualizado a quantidade ${qtdProductPolling}`);
    res.sendStatus(200);
});

app.post("/polling/add", (req, res) => {
    qtdProductPolling++;
    console.log(`[HTTP Polling] Atualizado a quantidade ${qtdProductPolling}`);
    res.sendStatus(200);
});

// WebSocket
wss.on("connection", (ws) => {
    console.log(`[WebSocket] Cliente conectado`);
    webSocketClients.add(ws);
    ws.send(JSON.stringify({ qtdProduct }));
    // When message update then update to all websocketClients
    ws.on("message", (data) => {
        console.log(`[WebSocket] message Data`);
        const dataParse = JSON.parse(data);
        if (dataParse.action == "buy") {
            qtdProduct--;
        } else if (dataParse.action == "add") {
            qtdProduct++;
        }
        console.log(`[WebSocket] Atualizado a quantidade ${qtdProduct}`);
        webSocketClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                webSocketClients.add(ws)
                client.send(JSON.stringify({ qtdProduct }));
            }
        });
    });

    // When client close connection delete then from websocketClients
    ws.on("close", () => {
        console.log(`[WebSocket] Cliente desconectado`);
        webSocketClients.delete(ws);
    })

    // When it occurs error show the error
    ws.on("error", (error) => {
        console.error(`[WebSocket] Erro: ${error}`);
    })
});

server.listen(9000, () => {
    console.log("Servidor rodando em http://localhost:9000");
    console.log("📡 HTTP Polling: Verifica mensagens a cada 3 segundos.");
    console.log("🔗 WebSocket: Comunicação em tempo real entre clientes.");
});
