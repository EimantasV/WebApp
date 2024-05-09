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
        WebSocketConnection.WS.onmessage = VideoConnection.handleServerMessage;
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
    static start(isInitializer) {


        const peerConnectionConfig = {
            'iceServers': [
                // {'urls': 'stun:stun.stunprotocol.org:3478'},
                // {'urls': 'stun:stun.l.google.com:19302'},
            ]
        };
        this.peerConnection = new RTCPeerConnection(peerConnectionConfig);
        this.peerConnection.onicecandidate = this.gotIceCandidate;
        this.peerConnection.ontrack = this.gotRemoteStream;

        // put in initiliz
        for (const track of this.localStream.getTracks()) {
            this.peerConnection.addTrack(track, this.localStream);
        }

        if (isInitializer) {

            this.peerConnection.createOffer().then(VideoConnection.createdDescription);
        }

        if (this.isDesktop) {
            this.peerConnection.onsignalingstatechange = () => {
                console.log('Signaling State:', VideoConnection.peerConnection.signalingState);
            };
            this.peerConnection.onicegatheringstatechange = () => {
                console.log('ICE Gathering State:', VideoConnection.peerConnection.iceGatheringState);
            };
            this.peerConnection.oniceconnectionstatechange = () => {
                console.log('ICE Connection State:', VideoConnection.peerConnection.iceConnectionState);
            };
        }
    }

    static gotIceCandidate(event) {
        console.log('sending ICE');
        if (event.candidate != null) {
            WebSocketConnection.WS.send(JSON.stringify({ 'data': event.candidate, 'type': "ice" }));
        }
    }

    static createdDescription(description) {
        console.log('Sending description', description);

        VideoConnection.peerConnection.setLocalDescription(description).then(() => {
            WebSocketConnection.WS.send(JSON.stringify({ 'data': VideoConnection.peerConnection.localDescription, 'type': "sdp" }));
        });
    }

    static gotRemoteStream(event) {
        console.log('got remote stream');
        VideoConnection.remoteVideo.srcObject = event.streams[0];
    }
}