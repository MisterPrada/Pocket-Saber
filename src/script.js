window.god = {
    alpha: 63.0,
    beta: 120.0,
    gamma: -22.0
}

import Experience from './Experience/Experience.js'
import Logdepthbuf_fragmentGlsl from "three/src/renderers/shaders/ShaderChunk/logdepthbuf_fragment.glsl.js";

const experience = new Experience(document.querySelector('canvas.webgl'))



const output = document.getElementById('output');
const config = {
    iceServers: [{
        urls: "stun:stun.l.google.com:19302" // list of free STUN servers: https://gist.github.com/zziuni/3741933
    }]
};
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", {
    negotiated: true,
    id: 0
});
const log = (msg) => {
    output.innerHTML += `<br>${msg}`
};
dc.onopen = () => chat.select();
dc.onmessage = e => {
    let data = JSON.parse(e.data)
    window.god = data;
    console.log(data)
};
pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);

chat.onkeypress = function(e) {
    if (e.keyCode != 13) return;
    dc.send(chat.value);
    log(chat.value);
    chat.value = "";
};

async function createOffer() {
    button.disabled = true;
    await pc.setLocalDescription(await pc.createOffer());
    pc.onicecandidate = ({
                             candidate
                         }) => {
        if (candidate) return;
        offer.value = pc.localDescription.sdp;
        offer.select();
        answer.placeholder = "Paste answer here. And Press Enter";
    };
}

offer.onkeypress = async function(e) {
    if (e.keyCode != 13 || pc.signalingState != "stable") return;
    button.disabled = offer.disabled = true;
    await pc.setRemoteDescription({
        type: "offer",
        sdp: offer.value
    });
    await pc.setLocalDescription(await pc.createAnswer());
    pc.onicecandidate = ({
                             candidate
                         }) => {
        if (candidate) return;
        answer.focus();
        answer.value = pc.localDescription.sdp;
        answer.select();
    };
};

answer.onkeypress = function(e) {
    if (e.keyCode != 13 || pc.signalingState != "have-local-offer") return;
    answer.disabled = true;
    pc.setRemoteDescription({
        type: "answer",
        sdp: answer.value
    });
};

pc.onconnectionstatechange = ev => handleChange();
pc.oniceconnectionstatechange = ev => handleChange();

function handleChange() {
    let stat = 'ConnectionState: <strong>' + pc.connectionState + '</strong> IceConnectionState: <strong>' + pc.iceConnectionState + '</strong>';
    document.getElementById('stat').innerHTML = stat;
    console.log('%c' + new Date().toISOString() + ': ConnectionState: %c' + pc.connectionState + ' %cIceConnectionState: %c' + pc.iceConnectionState,
        'color:yellow', 'color:orange', 'color:yellow', 'color:orange');
}
handleChange();

document.getElementById('button').onclick = () => {
    createOffer()
}


const print = ( message, selector ) => {
    const span = document.createElement( 'span' );

    span.innerHTML = message + `</br>`;

    document.getElementById( selector ).innerHTML = message + `</br>`
}

console.log(DeviceOrientationEvent)

function requestDeviceOrientation () {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', (event) => {
                        const alpha = event.alpha;
                        const beta = event.beta;
                        const gamma = event.gamma;


                        // to JSON
                        const data = {
                            alpha,
                            beta,
                            gamma
                        }

                        // to string
                        const string = JSON.stringify(data)
                        dc.send(string);

                        //print( `${ alpha }, ${ beta } ${ gamma }`, 'device-orientation-event' )
                    });
                }
            })
            .catch(console.error);
    } else {
        // handle regular non iOS 13+ devices
        console.log ("not iOS");
    }
}

// setInterval(function () {
//     const data = {
//         name : "11"
//     }
//
//     // to string
//     const string = JSON.stringify(data)
//
//     if( dc.readyState === 'open' ){
//         dc.send(string);
//     }
// }, 1000);

document.getElementById('enable').addEventListener('click', () => {
    requestDeviceOrientation();
});
