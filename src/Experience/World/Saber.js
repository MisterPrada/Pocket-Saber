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
            // document.getElementById('saber').addEventListener('click', () => {
            //     this.animation.actions.open.play()
            // });
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

        this.direction = new THREE.Vector3()
        this.velocity = new THREE.Vector3()
        this.center = new THREE.Vector3(0, 0, 0)
        this.radius = 3

        this.ACCELERATION_CONSTANT = 0.1
        this.LERP_FACTOR = 0.1
        this.CENTER_PULL_FACTOR = 0.001
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
        var alpha = THREE.MathUtils.degToRad(window.god.orientation.alpha); // z-axis rotation [0, 360)
        var beta = THREE.MathUtils.degToRad(window.god.orientation.beta);  // x-axis rotation [-180, 180)
        var gamma = THREE.MathUtils.degToRad(window.god.orientation.gamma); // y-axis rotation [-90, 90)

        var quaternion = new THREE.Quaternion();
        var euler = new THREE.Euler();

        // Можно также учесть ориентацию экрана, если это необходимо
        //var orient = THREE.MathUtils.degToRad(screen.orientation.angle);

        // Заметьте, что порядок 'ZXY' относится к порядку, в котором Euler будет применять вращения
        euler.set(beta, alpha, -gamma, 'YXZ'); // 'YXZ' для портретной ориентации устройства
        quaternion.setFromEuler(euler);

        this.group.quaternion.copy(quaternion)




        //
        // var x = window.god.motion.x * 0.01;
        // var y = window.god.motion.y * 0.01;
        // var z = window.god.motion.z * 0.01;
        // var interval = window.god.motion.interval;
        //
        // var deltaPosition = new THREE.Vector3(x, y, z);
        //
        //
        // // Обновляем вектор направления на основе данных акселерометра
        // this.direction.set(x, y, z);
        //
        // // Интеграция ускорения для получения скорости
        // this.velocity.addScaledVector(this.direction, this.ACCELERATION_CONSTANT * 50);
        //
        // // Добавляем "притягивающую" силу, направленную к центру
        // const centerPull = this.center.clone().sub(this.group.position).multiplyScalar(this.CENTER_PULL_FACTOR);
        // this.velocity.add(centerPull);
        //
        // // Применяем трение к скорости
        // this.velocity.multiplyScalar(0.90);
        //
        // if (this.velocity.length() > 2) {
        //     this.velocity.normalize().multiplyScalar(2);
        // }
        //
        // const newPosition = this.group.position.clone().addScaledVector(this.velocity, 0.001);
        //
        // // Ограничиваем движение в пределах сферы
        // if (newPosition.distanceTo(this.center) > this.radius) {
        //     newPosition.sub(this.center).normalize().multiplyScalar(this.radius).add(this.center);
        // }
        //
        //
        // // Используем lerp для плавного движения к новой позиции
        // this.group.position.lerp(newPosition, this.LERP_FACTOR);
        //
        // this.group.updateMatrix();
    }
}
