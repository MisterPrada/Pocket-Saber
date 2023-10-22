import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Saber {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.sound = this.experience.sound
        this.webRTC = this.experience.webrtc

        this.createModel()
        this.setAnimation()
        this.setActions()
    }

    setActions() {
        if ( this.experience.isMobile ) {
            document.getElementById('saber').addEventListener('click', () => {
                if(this.experience.webrtc.dc.readyState === 'open'){
                    const saberEnableMessage = {
                        saberEnable: true
                    }

                    this.experience.webrtc.dc.send(JSON.stringify(saberEnableMessage))
                }
            });

        } else {
            this.experience.webrtc.dc.addEventListener('message', (event) => {
                const data = JSON.parse(event.data)

                if (data.saberEnable){
                    this.animation.actions.open.play()
                    this.sound.saberOpenSound.play()
                    this.sound.saberIdleSound.play()
                }
            });
            document.getElementById('saber').addEventListener('click', () => {
                this.animation.actions.open.play()
                this.sound.saberOpenSound.play()
                this.sound.saberIdleSound.play()
            });
        }

    }

    createModel() {
        this.resource = this.experience.resources.items.lightSaberModel

        // create cube
        this.geometry = new THREE.BoxGeometry(0.1, 0.1, 1.4)
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        this.cube = new THREE.Mesh(this.geometry, this.material)

        // Create an empty group
        this.group = new THREE.Group();

        // Add the cube to the group
        //this.group.add(this.cube);
        this.cube.position.z = -0.5;

        this.model = this.resources.items.lightSaberModel.scene
        this.model.rotateY(-Math.PI / 2)
        this.group.add(this.model)

        this.scene.add(this.group)
    }

    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions
        this.animation.actions = {}

        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[11])
        this.animation.actions.open = this.animation.mixer.clipAction(this.resource.animations[5])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        this.animation.actions.open.loop = THREE.LoopOnce;
        this.animation.actions.open.clampWhenFinished = true
        //this.animation.actions.open.play()

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }
    }

    update() {
        if ( this.animation )
            this.animation.mixer.update(this.time.delta)

        // deviceorientation to quaternion
        var alpha = THREE.MathUtils.degToRad(this.webRTC.data.orientation.alpha); // z-axis rotation [0, 360)
        var beta = THREE.MathUtils.degToRad(this.webRTC.data.orientation.beta);  // x-axis rotation [-180, 180)
        var gamma = THREE.MathUtils.degToRad(this.webRTC.data.orientation.gamma); // y-axis rotation [-90, 90)

        var quaternion = new THREE.Quaternion();
        var euler = new THREE.Euler();

        euler.set(beta, alpha, -gamma, 'YXZ');
        quaternion.setFromEuler(euler);

        this.group.quaternion.copy(quaternion);
    }
}
