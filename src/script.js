window.god = {
    orientation: {
        alpha: 63.0,
        beta: 120.0,
        gamma: -22.0
    },
    motion: {
        x: 0.0,
        y: 0.0,
        z: 0.0
    }
}

const isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

import Experience from './Experience/Experience.js'
import QRCode from 'qrcode'

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

dc.onclose = () => log(`Closed`);
dc.onerror = err => log(`Error: ${err}`);

dc.onmessage = e => {
    let data = JSON.parse(e.data)

    if( data.orientation ) {
        window.god.orientation = data.orientation;
    }

    if( data.motion ) {
        window.god.motion = data.motion;
    }
}
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
                            orientation: {
                                alpha,
                                beta,
                                gamma
                            },
                            motion: {
                                x: 0.0,
                                y: 0.0,
                                z: 0.0
                            }
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

function requestDeviceMotion () {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', (event) => {
                        const acceleration = event.accelerationIncludingGravity;

                        const x = event.acceleration.x;
                        const y = event.acceleration.y;
                        const z = event.acceleration.z;

                        // to JSON
                        const data = {
                            motion: {
                                x,
                                y,
                                z
                            }
                        }

                        // to string
                        const string = JSON.stringify(data)
                        dc.send(string);
                    });
                }
            })
            .catch(console.error);
    } else {
        // handle regular non iOS 13+ devices
        console.log ("not iOS");
    }
}


requestDeviceOrientation()
requestDeviceMotion()
// document.getElementById('enable').addEventListener('click', () => {
//     requestDeviceOrientation();
// });



const ws = new WebSocket(`wss://192.168.0.179:3033`);

if(!isMobile.any()) {
    await pc.setLocalDescription(await pc.createOffer());

    pc.onicecandidate = ({ candidate }) => {
        if (candidate) return;
        ws.send(pc.localDescription.sdp)
    };
}

// ws send message
ws.onopen = () => {

};

ws.onmessage = async (message) => {
    if (isMobile.any()) {
        await pc.setRemoteDescription({
            type: "offer",
            sdp: message.data
        });
        await pc.setLocalDescription(await pc.createAnswer());

        ws.send(pc.localDescription.sdp)
    }else{
        pc.setRemoteDescription({
            type: "answer",
            sdp: message.data
        })
    }
}


// const generateQR = async text => {
//     try {
//         const imageQR = await QRCode.toDataURL(text)
//         document.getElementById('qrcode').src = imageQR
//     } catch (err) {
//         console.error(err)
//     }
// }
//
// generateQR('https://google.com')
