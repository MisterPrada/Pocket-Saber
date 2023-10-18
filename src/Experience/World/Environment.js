import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.scene.colorSpace = THREE.SRGBColorSpace

        this.setAmbientLight()
        this.setdirectionalLight()

        this.setDebug()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 2.)
        this.scene.add(this.ambientLight)
    }

    setdirectionalLight() {
        this.directionalLight = new THREE.DirectionalLight('#ffffff', 3)
        this.directionalLight.castShadow = true
        this.directionalLight.shadow.mapSize.set(1024, 1024)
        this.directionalLight.shadow.camera.far = 15
        this.directionalLight.shadow.camera.left = - 7
        this.directionalLight.shadow.camera.top = 7
        this.directionalLight.shadow.camera.right = 7
        this.directionalLight.shadow.camera.bottom = - 7
        this.directionalLight.position.set(5, 5, 5)
        this.scene.add(this.directionalLight)
    }


    setEnvironmentMap()
    {

    }

    setDebug() {
        if(this.debug.active) {

        }
    }
}
