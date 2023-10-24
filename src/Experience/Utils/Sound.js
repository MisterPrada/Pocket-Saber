import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'

export default class Sound extends EventEmitter
{
    constructor()
    {
        super()

        this.experience = new Experience()
        this.camera = this.experience.camera.instance
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.debug = this.experience.debug.panel
        this.sizes = this.experience.sizes

        this.soundsCreated = false;

    }

    isTabVisible() {
        return document.visibilityState === "visible";
    }

    handleVisibilityChange() {
        if (this.isTabVisible()) {
            this.saberIdleSound.play();
            this.listener.setMasterVolume(1)
        } else {
            this.saberIdleSound.pause();
            this.listener.setMasterVolume(0)
        }
    }

    createSounds() {
        if ( this.soundsCreated === true )
            return

        this.listener = new THREE.AudioListener();
        this.camera.add( this.listener );

        // this.backgroundSound = new THREE.Audio( this.listener );
        // this.backgroundSound.setBuffer( this.resources.items.backgroundSound );
        // this.backgroundSound.setLoop( true );
        // this.backgroundSound.setVolume( 0.8 );
        // this.backgroundSound.play();

        this.saberIdleSound = new THREE.Audio( this.listener );
        this.saberIdleSound.setBuffer( this.resources.items.saberIdleSound );
        this.saberIdleSound.setLoop( true );
        this.saberIdleSound.setVolume( 0.8 );
        //this.saberIdleSound.playbackRate = 1.0;


        this.saberOpenSound = new THREE.Audio( this.listener );
        this.saberOpenSound.setBuffer( this.resources.items.saberOpenSound );
        this.saberOpenSound.setLoop( false );
        this.saberOpenSound.setVolume( 0.8 );

        this.saberLeftSound = new THREE.Audio( this.listener );
        this.saberLeftSound.setBuffer( this.resources.items.saberLeftSound );
        this.saberLeftSound.setLoop( false );
        this.saberLeftSound.setVolume( 0.8 );

        this.saberRightSound = new THREE.Audio( this.listener );
        this.saberRightSound.setBuffer( this.resources.items.saberRightSound );
        this.saberRightSound.setLoop( false );
        this.saberRightSound.setVolume( 0.8 );


        this.soundsCreated = true;

        document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

        // window.addEventListener('blur', () => this.backgroundSound.pause());
        // window.addEventListener('focus', () => {
        //     if (isTabVisible()) {
        //         this.backgroundSound.play();
        //     }
        // });

    }

    update() {

    }

    resize() {

    }

}
