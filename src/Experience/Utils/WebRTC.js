import Experience from "../Experience.js"
import QRCode from "qrcode"

export default class WebRTC {
    constructor() {
        this.experience = new Experience();
        this.handshakeId = this.uuid();
        //this.handshakeId = 'misterprada';

        this.data = {
            orientation: {
                alpha: 63.0,
                beta: 120.0,
                gamma: -22.0
            },
            motion: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
                interval: 0.0
            }
        }

        this.config = {
            // iceServers: [{
            //     urls: "stun:stun.l.google.com:19302" // list of free STUN servers: https://gist.github.com/zziuni/3741933
            // }]
        };

        //this.initWebSocket()
        this.initPHP()
    }

    uuid = () => {
        let dt = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    generateQR = async url => {
        try {
            const imageQR = await QRCode.toDataURL(url)
            document.getElementById('qrcode').src = imageQR
        } catch (err) {
            console.error(err)
        }
    }

    handleDeviceOrientation = (event) => {
        const alpha = event.alpha
        const beta = event.beta
        const gamma = event.gamma

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

        if( this.dc.readyState === 'open' ) {
            this.dc.send(string);
        }

    }

    handleDeviceMotion = (event) => {
        const x = event.acceleration.x;
        const y = event.acceleration.y;
        const z = event.acceleration.z;
        const interval = event.interval;

        // to JSON
        const data = {
            orientation: {
                alpha: 0.0,
                beta: 0.0,
                gamma: 0.0
            },
            motion: {
                x,
                y,
                z,
                interval
            }
        }

        // to string
        const string = JSON.stringify(data)

        if( this.dc.readyState === 'open' ) {
            this.dc.send(string);
        }
    }

    requestAccessToDeviceSensors() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
                    } else {
                        console.error('Access to orientation not granted');
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
        }

        // if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        //     DeviceMotionEvent.requestPermission()
        //         .then(permissionState => {
        //             if (permissionState === 'granted') {
        //                 window.addEventListener('devicemotion', this.handleDeviceMotion, true);
        //             } else {
        //                 console.error('Access to motion not granted');
        //             }
        //         })
        //         .catch(console.error);
        // } else {
        //     window.addEventListener('devicemotion', this.handleDeviceMotion, true);
        // }
    }

    async initWebSocket() {
        const pc = new RTCPeerConnection(this.config);
        this.dc = pc.createDataChannel("chat", {
            negotiated: true,
            id: 0
        });
        const log = (msg) => { };
        this.dc.onopen = () => { };
        this.dc.onclose = () => log(`Closed`);
        this.dc.onerror = err => log(`Error: ${err}`);

        this.dc.onmessage = e => {
            let data = JSON.parse(e.data)

            if( data.orientation ) {
                this.data.orientation = data.orientation;
            }

            if( data.motion ) {
                this.data.motion = data.motion;
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

        this.requestAccessToDeviceSensors()

        document.getElementById('permissions').addEventListener('click', this.requestAccessToDeviceSensors)
        document.getElementById('calibrate').addEventListener('click', () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && this.data.orientation) {
                window.removeEventListener('deviceorientation', this.handleDeviceOrientation, true);
                window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
            }
        });

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
    }

    async initPHP() {
        const pc = new RTCPeerConnection(this.config);
        this.dc = pc.createDataChannel("chat", {
            negotiated: true,
            id: 0
        });
        const log = (msg) => { };
        this.dc.onopen = () => { };
        this.dc.onclose = () => log(`Closed`);
        this.dc.onerror = err => log(`Error: ${err}`);

        this.dc.onmessage = e => {
            let data = JSON.parse(e.data)

            if( data.orientation ) {
                this.data.orientation = data.orientation;
            }

            if( data.motion ) {
                this.data.motion = data.motion;
            }
        }
        pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);
        pc.onconnectionstatechange = ev => handleChange();
        pc.oniceconnectionstatechange = ev => handleChange();

        const handleChange = async () => {
            console.log('%c' + new Date().toISOString() + ': ConnectionState: %c' + pc.connectionState + ' %cIceConnectionState: %c' + pc.iceConnectionState,
                'color:yellow', 'color:orange', 'color:yellow', 'color:orange');

            if(pc.connectionState === 'connecting' && pc.signalingState != 'stable' && !this.experience.isMobile) {
                const response = await fetch(__HANDSHAKE_HOST__, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "id": this.handshakeId
                    })
                })
                const data = await response.json()

                pc.setRemoteDescription({
                    type: "answer",
                    sdp: data.answer
                })
            }
        }
        handleChange()

        this.requestAccessToDeviceSensors()

        document.getElementById('calibrate').addEventListener('click', () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && this.data.orientation) {
                window.removeEventListener('deviceorientation', this.handleDeviceOrientation, true);
                window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
            }
        });

        if( !this.experience.isMobile ) {
            await pc.setLocalDescription(await pc.createOffer());

            pc.onicecandidate = async ({ candidate }) => {
                if (candidate) return;

                await fetch(__HANDSHAKE_HOST__, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "id": this.handshakeId,
                        data: {
                            "offer": pc.localDescription.sdp
                        }
                    })
                }).then(async (response) => {
                    await response.json()

                    this.generateQR(`${window.location.origin}/?id=${this.handshakeId}`).then(() => {
                        this.experience.html.qrcode.style.display = 'block';
                    });
                })
            };
        }

        if ( this.experience.isMobile ){
            const urlParams = new URLSearchParams(window.location.search);
            this.handshakeId = urlParams.get('id');

            const response = await fetch(__HANDSHAKE_HOST__, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "id": this.handshakeId
                })
            })
            const data = await response.json()

            await pc.setRemoteDescription({
                type: "offer",
                sdp: data.offer
            });

            await pc.setLocalDescription(await pc.createAnswer());

            pc.onicecandidate = ({ candidate }) => {
                if (candidate) return;

                fetch(__HANDSHAKE_HOST__, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "id": this.handshakeId,
                        data: {
                            "answer": pc.localDescription.sdp
                        }
                    })
                })
            };
        }
    }
}
