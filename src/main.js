import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import Deck from './obj/deck.js';

// Canvas
const canvas = document.querySelector ( '#webgl' );

// Scene
const scene = new THREE.Scene ();

// Camera
const camera = new THREE.PerspectiveCamera ( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Controls
const controls = new OrbitControls ( camera, canvas );

// Renderer
const renderer = new THREE.WebGLRenderer ( {
    canvas: canvas
} );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize ( window.innerWidth, window.innerHeight );
renderer.setPixelRatio ( window.devicePixelRatio );

// Resize
window.addEventListener ( 'resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
} );

// Add Tabletop
const tabletopPlane = new THREE.PlaneGeometry ( 1.5, 1 );
const tabletopTexture = new THREE.TextureLoader().load ( 'res/table-texture.jpg' );
tabletopTexture.wrapS = THREE.RepeatWrapping;
tabletopTexture.wrapT = THREE.RepeatWrapping;
tabletopTexture.repeat.set ( 2, 1 );
const tabletopMaterial = new THREE.MeshBasicMaterial ( { map: tabletopTexture } );
const tabletop = new THREE.Mesh ( tabletopPlane, tabletopMaterial);
tabletop.position.set ( 0, 0, -0.0001 );
tabletop.receiveShadow = true;
scene.add ( tabletop );

// Light
const light = new THREE.PointLight ( 0xffffff, 1, 100 );
light.position.set ( 0, 0.5, 1 );
light.castShadow = true;
scene.add ( light );

// Create Deck
const deck = new Deck ();
deck.setPos ( -0.7, 0.3, 0 );
deck.addToScene ( scene );

// Position camera
camera.position.z = 1;

/* Render */

let t = 0;

var playerHand = [];

document.addEventListener ( 'keydown', ( event ) => {
    // Deal card when 'd' is pressed
    if ( event.key === 'd' ) {
        // Reset the deck when it's empty
        if ( deck.cards.length === 0 ) {
            deck.createDeck ();
            deck.shuffle ();

            // Reset player hand
            for ( let i = 0; i < playerHand.length; i++ ) {
                scene.remove ( playerHand[i].cardMesh );
            }
            playerHand = [];
        }
        
        deck.deal ( playerHand );

        // Set card position in a 4x13 grid
        playerHand[playerHand.length - 1].setPos ( ( playerHand.length - 1 ) % 13 * 0.1 - 0.6, Math.floor ( ( playerHand.length - 1 ) / 13 ) * -0.1 + 0.3, 0.001 );

        // Add card to scene
        playerHand[playerHand.length - 1].addToScene ( scene );

    }

    // Deal all cards randomly across the table when 'a' is pressed
    if ( event.key === 'a' ) {
        // Reset the deck
        deck.createDeck ();
        deck.shuffle ();

        // Reset player hand
        for ( let i = 0; i < playerHand.length; i++ ) {
            scene.remove ( playerHand[i].cardMesh );
        }
        playerHand = [];

        // Deal all cards
        for ( let i = 0; i < 52; i++ ) {
            deck.deal ( playerHand );

            // Set card position randomly scattered across the table
            playerHand[playerHand.length - 1].setPos ( Math.random () * 1.5 - 0.75, Math.random () * 1 - 0.5, Math.random () * 0.001 );

            // Add card to scene
            playerHand[playerHand.length - 1].addToScene ( scene );
        }
    }

    // Reset the deck when 'r' is pressed
    if ( event.key === 'r' ) {
        deck.createDeck ();
        deck.shuffle ();

        // Reset player hand
        for ( let i = 0; i < playerHand.length; i++ ) {
            scene.remove ( playerHand[i].cardMesh );
        }
        playerHand = [];
    }
} );

const animate = () => {
    requestAnimationFrame(animate);

    // Camera controls
    controls.update();

    renderer.render(scene, camera);
}
animate();
