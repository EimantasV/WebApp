class WebSocketConnection{

    static WS;
    
    static{
        this.WS = new WebSocket(`wss://${window.location.hostname}:3000`);
        this.WS.onmessage = this.handleServerMessage;
    }
    static handleServerMessage(message) {
        console.log("From server:", message);
        if (!VideoConnection.peerConnection) VideoConnection.start(false);

        const signal = JSON.parse(message.data);

        if (signal.type === "sdp") {
            VideoConnection.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data)).then(() => {
                // Only create answers in response to offers
                if (signal.data.type !== 'offer') return;

                VideoConnection.peerConnection.createAnswer().then(VideoConnection.createdDescription);
            });
        } else if (signal.type === "ice") {
            VideoConnection.peerConnection.addIceCandidate(new RTCIceCandidate(signal.data));
        }
    }
    static close()
    {
        this.WS.close();
    }
}