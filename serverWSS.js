class ServerWSS {
    static WebSocketServer;
    static wss;
    static {
        const { WebSocketServer } = require("ws");
        this.WebSocketServer = WebSocketServer;
    }
    static start({ serverHTTPS, sendUDP }) {
        this.wss = new this.WebSocketServer({ server: serverHTTPS });
        this.wss.on("listening", () => {
            console.log("WSS server is online");
        });

        this.wss.on("connection", (ws) => {
            console.log("User connected to Websocket!");
            let otherClient;

            ws.on("message", msg => {
                if (!otherClient) otherClient = [...this.wss.clients].find(cli => cli !== ws);

                const input = JSON.parse(`${msg}`);
                console.log("Server got:", input.type);
                switch (input.type) {
                    case "sdp":
                    case "ice":
                        otherClient.send(`${msg}`);
                        break;

                    case "com":
                        sendUDP(`${input.data}`);
                        break;

                    default:
                        otherClient.send(`${msg}`);
                        console.log(`${msg}`);
                        break;
                }
            });
        });
    }
}

exports.ServerWSS = ServerWSS;