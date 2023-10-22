import Experience from '../Experience.js'
import Environment from './Environment.js'
import Saber from './Saber.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera;
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound
        this.debug = this.experience.debug.panel

        // Wait for resources
        this.resources.on('ready', () =>
        {
            this.html.playButton.classList.add("fade-in");

            this.html.playButton.addEventListener('click', () => {
                // Send request to access device sensors
                this.experience.webrtc.requestAccessToDeviceSensors();

                setTimeout(() => {
                    // Hide play button
                    this.html.playButton.classList.replace("fade-in", "fade-out");


                    this.experience.time.start = Date.now()
                    this.experience.time.elapsed = 0

                    // Setup
                    this.sound.createSounds()

                    this.saber = new Saber()
                    this.environment = new Environment()
                    // Remove preloader

                    // Remove preloader
                    this.html.preloader.classList.add("preloaded");
                    setTimeout(() => {
                        this.html.preloader.remove();
                        this.html.playButton.remove();
                    }, 2500);

                    // Animation timeline
                    this.animationPipeline();
                }, 100);
            }, { once: true })
        })
    }

    animationPipeline() {
        // if ( this.text )
        //     this.text.animateTextShow()

        if ( this.camera )
            this.camera.animateCameraPosition()
    }

    resize() {

    }

    update()
    {
        if ( this.saber )
            this.saber.update()
    }
}
