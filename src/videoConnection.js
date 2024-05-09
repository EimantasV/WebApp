class VideoConnection {
    static localStream;
    static localVideo;
    static remoteVideo;
    static peerConnection;
    static isDesktop = false;

    static initializerStreamsOnly = true; // make it false if you want 2 way connection

    static {
        try {
            this.localVideo = document.getElementById('localVideo');
            if (this.localVideo) {
                this.getVideoStream();
            }
            else {
                this.isDesktop = true;
                console.log("No local video stream, if this is desktop then okay.");
            }
        }
        catch {

        }

        this.remoteVideo = document.getElementById('remoteVideo');

    }

    static async getVideoStream() {
        const constraints = {
            video: {
                facingMode: { ideal: "environment" },
                // width: { ideal: 1920 },
                // height: { ideal: 1080 },
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 20 },
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


        const peerConnectionConfig = {
            'iceServers': [
                // {'urls': 'stun:stun.stunprotocol.org:3478'},
                // {'urls': 'stun:stun.l.google.com:19302'},
            ]
        };
        this.peerConnection = new RTCPeerConnection(peerConnectionConfig);
        this.peerConnection.onicecandidate = this.gotIceCandidate;
        this.peerConnection.ontrack = this.gotRemoteStream;

        if (isInitializer && this.initializerStreamsOnly) {
            for (const track of this.localStream.getTracks()) {
                this.peerConnection.addTrack(track, this.localStream);
            }
        }

        if (isInitializer) {
            this.peerConnection.createOffer().then(VideoConnection.createdDescription);
        }

        // if (this.isDesktop) {
        this.peerConnection.onsignalingstatechange = () => {
            console.log('Signaling State:', VideoConnection.peerConnection.signalingState);
        };
        this.peerConnection.onicegatheringstatechange = () => {
            console.log('ICE Gathering State:', VideoConnection.peerConnection.iceGatheringState);
        };
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', VideoConnection.peerConnection.iceConnectionState);
            if (VideoConnection.peerConnection.iceConnectionState === "connected") {
                WebSocketConnection.close();
            }
        };
        // }
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