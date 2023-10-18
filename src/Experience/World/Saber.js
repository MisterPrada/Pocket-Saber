import * as THREE from 'three'
import Experience from '../Experience.js'
import {vec3} from "three/nodes";

export default class Saber {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance

        this.createModel()
    }


    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    createModel() {
        // create cube
        this.geometry = new THREE.BoxGeometry(0.1, 0.1, 1.4)
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        this.cube = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.cube)
    }

    update() {
        // deviceorientation to quaternion
        var alpha = THREE.MathUtils.degToRad(window.god.alpha); // z-axis rotation [0, 360)
        var beta = THREE.MathUtils.degToRad(window.god.beta);  // x-axis rotation [-180, 180)
        var gamma = THREE.MathUtils.degToRad(window.god.gamma); // y-axis rotation [-90, 90)

        var quaternion = new THREE.Quaternion();
        var euler = new THREE.Euler();

        // Можно также учесть ориентацию экрана, если это необходимо
        //var orient = THREE.MathUtils.degToRad(screen.orientation.angle);

        // Заметьте, что порядок 'ZXY' относится к порядку, в котором Euler будет применять вращения
        euler.set(beta, alpha, -gamma, 'YXZ'); // 'YXZ' для портретной ориентации устройства
        quaternion.setFromEuler(euler);

        this.cube.quaternion.copy(quaternion)
    }
}
