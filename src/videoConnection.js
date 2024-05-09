class VideoConnection {
    static localStream;
    static localVideo;
    static remoteVideo;
    static peerConnection;
    static isDesktop = false;

    static {
        try {
            this.localVideo = document.getElementById('localVideo');
            if (this.localVideo) {
                this.getVideoStream();
            }
        }
        catch {
            this.isDesktop = true;
            console.log("No local video stream, if this is desktop then okay.");
        }
        this.remoteVideo = document.getElementById('remoteVideo');

    }

    static async getVideoStream() {
        const constraints = {
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 },
            },
            audio: true,
        };

        if (!navigator.mediaDevices.getUserMedia) {
            alert('No user media found!');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localStream = stream;
            this.localVideo.srcObject = stream;
        } catch (error) {
            console.log(error);
        }
    }
    static start(isInitializer) {
        WebSocketConnection.WS.onmessage = this.handleServerMessage;

        const peerConnectionConfig = {
            'iceServers': [
                // {'urls': 'stun:stun.stunprotocol.org:3478'},
                // {'urls': 'stun:stun.l.google.com:19302'},
            ]
        };
        this.peerConnection = new RTCPeerConnection(peerConnectionConfig);
        this.peerConnection.onicecandidate = this.gotIceCandidate;
        this.peerConnection.ontrack = this.gotRemoteStream;


        if (isInitializer) {
            for (const track of this.localStream.getTracks()) {
                this.peerConnection.addTrack(track, this.localStream);
            }
            this.peerConnection.createOffer().then(this.createdDescription).catch(errorHandler);
        }

        if (this.isDesktop) {
            this.peerConnection.onsignalingstatechange = () => {
                console.log('Signaling State:', peerConnection.signalingState);
            };
            this.peerConnection.onicegatheringstatechange = () => {
                console.log('ICE Gathering State:', peerConnection.iceGatheringState);
            };
            this.peerConnection.oniceconnectionstatechange = () => {
                console.log('ICE Connection State:', peerConnection.iceConnectionState);
            };
        }
    }
    static handleServerMessage(message) {
        if (!this.peerConnection) start(false);

        const signal = JSON.parse(message.data);

        if (signal.type === "sdp") {
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data)).then(() => {
                // Only create answers in response to offers
                if (signal.data.type !== 'offer') return;

                this.peerConnection.createAnswer().then(this.createdDescription).catch(console.log("fail 90"));
            }).catch(console.log("fail 90"));
        } else if (signal.type === "ice") {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.data)).catch(console.log("fail 90"));
        }
    }
    static gotIceCandidate(event) {
        if (event.candidate != null) {
            WebSocketConnection.WS.send(JSON.stringify({ 'data': event.candidate, 'type': "ice" }));
        }
    }

    static createdDescription(description) {
        console.log('got description');

        VideoConnection.peerConnection.setLocalDescription(description).then(() => {
            WebSocketConnection.WS.send(JSON.stringify({ 'data': VideoConnection.peerConnection.localDescription, 'type': "sdp" }));
        }).catch(errorHandler);
    }

    static gotRemoteStream(event) {
        console.log('got remote stream');
        this.remoteVideo.srcObject = event.streams[0];
    }
}