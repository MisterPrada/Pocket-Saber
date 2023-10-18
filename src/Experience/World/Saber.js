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
        this.resources = this.experience.resources

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

    update() {
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


        var maxX = 1; // максимальная x-координата
        var minX = -1; // минимальная x-координата
        var maxY = 1; // максимальная y-координата
        var minY = -1; // минимальная y-координата
        var maxZ = 1; // максимальная z-координата
        var minZ = -1; // минимальная z-координата

        var x = window.god.motion.x;
        var y = window.god.motion.y;
        var z = window.god.motion.z;

        var deltaPosition = new THREE.Vector3(x, y, z);


        // Проверка пределов для каждой координаты
        // this.group.position.x = Math.min(Math.max(this.group.position.x, minX), maxX);
        // this.group.position.y = Math.min(Math.max(this.group.position.y, minY), maxY);
        // this.group.position.z = Math.min(Math.max(this.group.position.z, minZ), maxZ);
    }
}
