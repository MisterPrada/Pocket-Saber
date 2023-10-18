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

        //this.setAmbientLight()

        this.setDebug()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.05)
        this.scene.add(this.ambientLight)
    }


    setEnvironmentMap()
    {

    }

    setDebug() {
        if(this.debug.active) {

        }
    }
}
