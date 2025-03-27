let pollingInterval;
let ws;

// polling code
(function startPolling() {
    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch("/polling");
            const data = await response.json();
            if (data.qtdProductPolling) {
                document.getElementById("pollingQtd").innerText =
                    data.qtdProductPolling;
            }
        } catch (error) {
            console.error("[Polling] Erro ao buscar a mensage: ", error);
        }
    }, 2000);
})();

async function pollingBuy() {
    try {
        await fetch("/polling/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        let newVal =
            parseInt(document.getElementById("pollingQtd").textContent) - 1;
        document.getElementById("pollingQtd").innerText = newVal;
    } catch (error) {
        console.error("[Polling] Erro ao comprar: ", error);
    }
}

async function pollingAdd() {
    try {
        await fetch("/polling/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        let newVal =
            parseInt(document.getElementById("pollingQtd").textContent) + 1;
        document.getElementById("pollingQtd").innerText = newVal;
    } catch (error) {
        console.error("[Polling] Erro ao adicionar: ", error);
    }
}

// webSocket code
function startWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("WebSocket já está conectado");
        return;
    }

    // init new webSocket connection
    ws = new WebSocket("ws://localhost:9000");
    ws.onopen = () => {
        let wsStatus = document.getElementById("webSocketStatus");
        wsStatus.className = "online";
        wsStatus.innerText = "Conectado";
    };

    // receive update to product quantity
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(`onmessage event newQtdProduct ${data}`);
        document.getElementById("webSocketQtd").innerText = data.qtdProduct;
    };

    // when it occurs error on connection
    ws.onerror = (error) => {
        console.log(`[WebSocket] Erro: ${error}`);
        let wsStatus = document.getElementById("webSocketStatus");
        wsStatus.className = "offline";
        wsStatus.innerText = "Erro na conexão!";
    };

    ws.onclose = () => {
        let wsStatus = document.getElementById("webSocketStatus");
        wsStatus.innerText = "Desconectado";
        wsStatus.className = "offline";
        document.getElementById("webSocketQtd").innerText = "Desconectado"
    };
}

function stopWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("Conexão WebSocket fechada manualmente");
    }

    // }
}

function webSocketAction(action) {
    let newVal = parseInt(document.getElementById("webSocketQtd").textContent);
    console.log(action);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action }));
        if (action == "buy") {
            newVal--;
        } else if (action == "add") {
            newVal++;
        }
        document.getElementById("webSocketQtd").innerText = newVal;
        console.log(`[WebSocket] Produto atualizado para: ${newVal}`);
    } else {
        console.warn("[WebSocket] Cliente não conectado");
        let wsStatus = document.getElementById("webSocketStatus");
        wsStatus.className = "offline";
        wsStatus.innerText = "Erro: WebSocket não conectado";
    }
}
