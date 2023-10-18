export default class WebRTC {
    constructor() {
        this.init()
    }

    async init() {
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
        dc.onopen = () => { };
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

        pc.onconnectionstatechange = ev => handleChange();
        pc.oniceconnectionstatechange = ev => handleChange();

        function handleChange() {
            console.log('%c' + new Date().toISOString() + ': ConnectionState: %c' + pc.connectionState + ' %cIceConnectionState: %c' + pc.iceConnectionState,
                'color:yellow', 'color:orange', 'color:yellow', 'color:orange');
        }
        handleChange();

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
                            });
                        }
                    })
                    .catch(console.error);
            } else {
                // handle regular non iOS 13+ devices
                //console.log ("not iOS");
            }
        }

        requestDeviceOrientation()

        document.getElementById('permissions').addEventListener('click', requestDeviceOrientation)

        const ws = new WebSocket(`wss://${__SOCKET_HOST__}:${__SOCKET_PORT__}`);

        if(!isMobile.any()) {
            await pc.setLocalDescription(await pc.createOffer());

            pc.onicecandidate = ({ candidate }) => {
                if (candidate) return;
                ws.send(pc.localDescription.sdp)
            };
        }

// ws send message
        ws.onopen = () => {};

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
    }
}