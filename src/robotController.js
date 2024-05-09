class Robot {
    static {

    }
    static sendState(data) {
        WebSocketConnection.WS.send(JSON.stringify({ "type": "com", data: data }));
    }
}