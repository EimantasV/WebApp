const peerConnectionConfig = {
    'iceServers': [
        // {'urls': 'stun:192.168.0.1:3478'},
        // {'urls': 'stun:stun.stunprotocol.org:3478'},
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
                //   case "req":
                //       console.log("Sending offer...");
                //       const offer = await createOffer();
                //       socket.send(JSON.stringify(offer));
                //       break;

                case "offer":
                    console.log("Got offer, sending answer...");
                    const answer = await createAnswer(msg);
                    socket.send(JSON.stringify(answer));

                    break;

                case "answer":
                    console.log("Got answer!");
                    await getAnswer(msg);
                    break;

                case "ice":
                    console.log("Got ICE ICE BABY!");
                    peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
                    break;
            }
        });

    } catch (error)
    {
        console.error('Error:', error);
    }
};

main();

const start = async () =>
{
    peerConnection = new RTCPeerConnection(peerConnectionConfig);

    peerConnection.onicecandidate = event =>
    {
        console.log("ice gen?");
        if (event.candidate != null)
            socket.send(JSON.stringify({ 'data': event.candidate, 'type': "ice" }));
    };
    peerConnection.ontrack = async event =>
    {
        console.log("got track ans");
        document.getElementById("user-2").srcObject = event.streams[0];

    };

    peerConnection.onsignalingstatechange = () =>
    {
        console.log('Signaling State:', peerConnection.signalingState);
    };
    peerConnection.onicegatheringstatechange = () =>
    {
        console.log('ICE Gathering State:', peerConnection.iceGatheringState);
    };
    peerConnection.oniceconnectionstatechange = () =>
    {
        console.log('ICE Connection State:', peerConnection.iceConnectionState);
    };

    console.log("Sending offer...");
    const offer = await createOffer();
    socket.send(JSON.stringify(offer));
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

const sendHTTP = (data) =>
{
    socket.send(JSON.stringify({ "type": "com", data: data }));
};