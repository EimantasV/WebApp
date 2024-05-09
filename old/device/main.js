const getCamerasSpecs = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    for (const device of devices) {
        // console.log(device);

        // socket.send(JSON.stringify(device));
        if ('getCapabilities' in device) {
            const capabilities = device.getCapabilities();
            console.log(JSON.stringify(capabilities));
            socket.send(JSON.stringify(capabilities));
        }

    }
};

const setupMediaRecorder = async () => {
    const constraints = {
         video: true,
        // video: {
        //     facingMode: { ideal: "environment" },
        //     width: { ideal: 1920 },
        //     height: { ideal: 1080 },
        //     frameRate: { ideal: 30 },
        //     // bitrate: { ideal: 20000000 }
        //     // width: { exact: 3840 },
        //     // height: { exact: 2160 },
        //     // frameRate: { ideal: 30 },
        // },
        audio: true
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.getElementById('user-1');
        videoElement.srcObject = stream;
        return stream;
    }
    catch (error) {
        socket.send(JSON.stringify({ type: "device-msg", data: `Media recorder: ${error}` }));
        console.error('Error accessing the camera with constraints:', error);
    }
};

const peerConnectionConfig = {
    'iceServers': [
        // {'urls': 'stun:192.168.0.1:3478'},
        //{ 'urls': 'stun:stun.stunprotocol.org:3478' },
        // {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

let peerConnection;// = new RTCPeerConnection(peerConnectionConfig);


let socket;
let localStream;
let remoteStream;


const main = async () => {
    try {
        socket = new WebSocket(`wss://${window.location.hostname}:3000`);

        localStream = await setupMediaRecorder();

        // wait getCamerasSpecs();
        socket.addEventListener('error', (error) => {
            console.log('Could not connect');
        });
        socket.addEventListener('open', () => {
            console.log('WebSocket connection opened');
        });

        socket.addEventListener("message", async (_msg) => {
            const msg = JSON.parse(_msg.data);
            console.log(msg);
            switch (msg.type) {

                case "offer":

                    loadRTC();

                    socket.send(JSON.stringify({ 'data': "Got offer, sending answer...", 'type': "device-msg" }));
                    console.log("Got offer, sending answer...");
                    const answer = await createAnswer(msg);
                    socket.send(JSON.stringify(answer));

                    break;


                case "ice":
                    socket.send(JSON.stringify({ 'data': "Got ICE ICE BABY!", 'type': "device-msg" }));
                    console.log("Got ICE ICE BABY!");
                    peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
                    break;
            }
        });

    } catch (error) {
        socket.send(JSON.stringify({ 'data': `Main error: ${error}`, 'type': "device-msg" }));
        console.error('Error:', error);
    }
};

main();

const loadRTC = () => {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);


    peerConnection.onicecandidate = iceCandidate;

    for (const track of localStream.getTracks()) {
        peerConnection.addTrack(track, localStream);
    }





};

const iceCandidate = (event) => {
    socket.send(JSON.stringify({ 'data': "ice gen?", 'type': "device-msg" }));
    console.log("ice gen?");
    if (event.candidate != null)
        socket.send(JSON.stringify({ 'data': event.candidate, 'type': "ice" }));
};



const createAnswer = async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    return peerConnection.localDescription;
};
