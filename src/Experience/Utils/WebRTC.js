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
                z: 0.0,
                interval: 0.0
            },
            calibration: {
                alpha: 0,
                beta: 0,
                gamma: 0
            }
        }

        const config = {
            iceServers: [{
                urls: "stun:stun.l.google.com:19302" // list of free STUN servers: https://gist.github.com/zziuni/3741933
            }]
        };
        const pc = new RTCPeerConnection(config);
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

        let handleDeviceOrientation = (event) => {
            const alpha = event.alpha - window.god.calibration.alpha;
            const beta = event.beta - window.god.calibration.beta;
            const gamma = event.gamma - window.god.calibration.gamma;

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
        let handleDeviceMotion = (event) => {

                const x = event.acceleration.x;
                const y = event.acceleration.y;
                const z = event.acceleration.z;
                const interval = event.interval;

                document.getElementById('accx').innerHTML = x;
                document.getElementById('accy').innerHTML = y;
                document.getElementById('accz').innerHTML = z;

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

        function requestAccessToDeviceSensors() {
            // Запрос доступа к событиям ориентации устройства
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', handleDeviceOrientation, true);
                        } else {
                            console.error('Доступ к ориентации устройства не предоставлен');
                        }
                    })
                    .catch(console.error);
            } else {
                // Обычные устройства, не требующие явного разрешения
                window.addEventListener('deviceorientation', handleDeviceOrientation, true);
            }

            // Запрос доступа к событиям движения устройства
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('devicemotion', handleDeviceMotion, true);
                        } else {
                            console.error('Доступ к акселерометру не предоставлен');
                        }
                    })
                    .catch(console.error);
            } else {
                // Обычные устройства, не требующие явного разрешения
                window.addEventListener('devicemotion', handleDeviceMotion, true);
            }
        }
        requestAccessToDeviceSensors()

        document.getElementById('permissions').addEventListener('click', requestAccessToDeviceSensors)
        document.getElementById('calibrate').addEventListener('click', () => {
            // Если у нас есть доступ к DeviceOrientationEvent, получаем текущие значения
            if (typeof DeviceOrientationEvent !== 'undefined' && window.god.orientation) {
                window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
                window.addEventListener('deviceorientation', handleDeviceOrientation, true);
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
