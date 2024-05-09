class WebSocketConnection{

    static WS;
    
    static{
        this.WS = new WebSocket(`wss://${window.location.hostname}:3000`);
    }
    static close()
    {
        this.WS.close();
    }
}