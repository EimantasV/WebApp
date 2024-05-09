const getCamerasSpecs = async () =>
{
    const devices = await navigator.mediaDevices.enumerateDevices();

    for (const device of devices)
    {
        // console.log(device);

        // socket.send(JSON.stringify(device));
        if ('getCapabilities' in device)
        {
            const capabilities = device.getCapabilities();
            console.log(JSON.stringify(capabilities));
            socket.send(JSON.stringify(capabilities));
        }

    }
};

const setupMediaRecorder = async () =>
{
    const constraints = {
        // video: true,
        video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
            // bitrate: { ideal: 20000000 }
            // width: { exact: 3840 },
            // height: { exact: 2160 },
            // frameRate: { ideal: 30 },
        },
        audio: true
    };

    try
    {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // console.log('Stream obtained with requested constraints:', stream);
        const videoElement = document.getElementById('user-1');
        videoElement.srcObject = stream;
        // socket.send(JSON.stringify({type:"msg", data: stream}))
        return stream;
    }
    catch (error)
    {
        // socket.send(JSON.stringify({type:"msg", data: error}))
        console.error('Error accessing the camera with constraints:', error);
    }
};

const peerConnectionConfig = {
    'iceServers': [
        // {'urls': 'stun:192.168.0.1:3478'},
        { 'urls': 'stun:stun.stunprotocol.org:3478' },
        // {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

let peerConnection;// = new RTCPeerConnection(peerConnectionConfig);


let socket;
let localStream;
let remoteStream;


const main = async () =>
{
    try
    {

        localStream = await setupMediaRecorder();

        for (const track of localStream.getTracks())
        {
            peerConnection.addTrack(track, localStream);
        }

        socket = new WebSocket(`wss://${window.location.hostname}:3000`);

        // wait getCamerasSpecs();
        socket.addEventListener('error', (error) =>
        {
            console.log('Could not connect');
        });
        socket.addEventListener('open', () =>
        {
            console.log('WebSocket connection opened');
        });

        socket.addEventListener("message", async (_msg) =>
        {
            const msg = JSON.parse(_msg.data);
            console.log(msg);
            switch (msg.type)
            {
                // case "req":
                //     console.log("Sending offer...");
                //     const offer = await createOffer();
                //     socket.send(JSON.stringify(offer));
                //     break;

                case "offer":

                    loadRTC();

                    socket.send(JSON.stringify({ 'data': "Got offer, sending answer...", 'type': "device-msg" }));
                    console.log("Got offer, sending answer...");
                    const answer = await createAnswer(msg);
                    socket.send(JSON.stringify(answer));

                    break;

                case "answer":

                    console.log("Got answer!");
                    await getAnswer(msg);
                    break;

                case "ice":
                    socket.send(JSON.stringify({ 'data': "Got ICE ICE BABY!", 'type': "device-msg" }));
                    console.log("Got ICE ICE BABY!");
                    peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
                    break;

                case "com":
                    makeHttpRequest(msg.data);
                    break;
            }
        });

    } catch (error)
    {
        console.error('Error:', error);
    }
};

main();

const loadRTC = () =>
{
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = async event =>
    {
        socket.send(JSON.stringify({ 'data': "ice gen?", 'type': "device-msg" }));
        console.log("ice gen?");
        if (event.candidate != null)
            socket.send(JSON.stringify({ 'data': event.candidate, 'type': "ice" }));
    };


    peerConnection.onsignalingstatechange = () =>
    {
        socket.send(JSON.stringify({ 'data': `Signaling State: ${peerConnection.signalingState}`, 'type': "device-msg" }));
        console.log('Signaling State:', peerConnection.signalingState);
    };
    peerConnection.onicegatheringstatechange = () =>
    {
        socket.send(JSON.stringify({ 'data': `ICE Gathering State: ${peerConnection.iceGatheringState}`, 'type': "device-msg" }));
        console.log('ICE Gathering State:', peerConnection.iceGatheringState);
    };
    peerConnection.oniceconnectionstatechange = () =>
    {
        socket.send(JSON.stringify({ 'data': `ICE Connection State: ${peerConnection.iceConnectionState}`, 'type': "device-msg" }));
        console.log('ICE Connection State:', peerConnection.iceConnectionState);
    };
};

const sendHTTP = async (data) =>
{
    const url = 'http://192.168.0.2';

    try
    {
        const response = await fetch(url);

        // Check if the request was successful (status code 200 OK)
        if (!response.ok)
        {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response as needed (JSON, text, etc.)
        const data = await response.text(); // or response.json() for JSON data

        // Handle the data from the response
        console.log(data);
    } catch (error)
    {
        // Handle errors during the fetch
        console.error('Fetch error:', error);
    }
};

const createOffer = async () =>
{

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    return peerConnection.localDescription;
};

const createAnswer = async (offer) =>
{
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    return peerConnection.localDescription;
};

const getAnswer = async (answer) =>
{
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

async function makeHttpRequest(postdata)
{
    const url = `http://192.168.61.99:4000`;
    // log(url)
    try
    {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postdata),
        });

        if (!response.ok)
        {
            // log(`HTTP error! Status: ${response.status}`)

        }

        const data = await response.json();
        // log(`HTTP Request Successful: ${data}`);
    } catch (error)
    {
        socket.send(JSON.stringify({ type: "debug", data: `HTTP Error: ${error}` }));
        // log(`HTTP Error: ${error}`);
    }
}