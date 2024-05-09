let localStream;
let localVideo;
let peerConnection;
let remoteVideo;
let serverConnection;

const peerConnectionConfig = {
  'iceServers': [
    // {'urls': 'stun:192.168.0.1:3478'},
    // {'urls': 'stun:stun.stunprotocol.org:3478'},
    // {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

async function pageReady()
{
  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  serverConnection = new WebSocket(`wss://${window.location.hostname}:3000`);
  serverConnection.onmessage = gotMessageFromServer;

  const constraints = {
    video: true,
    audio: true,
  };

  if (!navigator.mediaDevices.getUserMedia)
  {
    alert('Your browser does not support getUserMedia API');
    return;
  }

  try
  {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    localStream = stream;
    localVideo.srcObject = stream;
  } catch (error)
  {
    errorHandler(error);
  }
}

function start(isCaller)
{
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.ontrack = gotRemoteStream;

  if (!isCaller)
    {
    for (const track of localStream.getTracks())
    {
      peerConnection.addTrack(track, localStream);
    }
}

  if (isCaller)
  {
    peerConnection.createOffer().then(createdDescription).catch(errorHandler);
  }
}

function gotMessageFromServer(message)
{
  if (!peerConnection) start(false);

  const signal = JSON.parse(message.data);


  if (signal.sdp)
  {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() =>
    {
      // Only create answers in response to offers
      if (signal.sdp.type !== 'offer') return;

      peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
    }).catch(errorHandler);
  } else if (signal.ice)
  {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
  }
}

function gotIceCandidate(event)
{
  if (event.candidate != null)
  {
    serverConnection.send(JSON.stringify({ 'ice': event.candidate }));
  }
}

function createdDescription(description)
{
  console.log('got description');

  peerConnection.setLocalDescription(description).then(() =>
  {
    serverConnection.send(JSON.stringify({ 'sdp': peerConnection.localDescription}));
  }).catch(errorHandler);
}

function gotRemoteStream(event)
{
  console.log('got remote stream');
  remoteVideo.srcObject = event.streams[0];
}

function errorHandler(error)
{
  console.log(error);
}
