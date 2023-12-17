import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Deck from './obj/deck.js';

// Canvas
const canvas = document.querySelector ( '#webgl' );

// Scene
const scene = new THREE.Scene ();

// Camera
const camera = new THREE.PerspectiveCamera ( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Controls
const controls = new OrbitControls ( camera, canvas );
controls.enableDamping = true;

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

// Position camera
camera.position.z = 1;

/* Render */

let t = 0;

// document.addEventListener ( 'keydown', ( event ) => {
//     // Deal card when 'd' is pressed
//     if ( event.key === 'd' ) {
//         // Reset the deck when it's empty
//         if ( deck.cards.length === 0 ) {
//             deck.createDeck ();
//             deck.shuffle ();

//             // Reset player hand
//             for ( let i = 0; i < playerHand.length; i++ ) {
//                 scene.remove ( playerHand[i].cardMesh );
//             }
//             playerHand = [];
//         }
        
//         deck.deal ( playerHand );

//         // Set card position in a 4x13 grid
//         playerHand[playerHand.length - 1].setPos ( ( playerHand.length - 1 ) % 13 * 0.1 - 0.6, Math.floor ( ( playerHand.length - 1 ) / 13 ) * -0.1 + 0.3, 0.001 );

//         // Add card to scene
//         playerHand[playerHand.length - 1].addToScene ( scene );

//     }

//     // Deal all cards randomly across the table when 'a' is pressed
//     if ( event.key === 'a' ) {
//         // Reset the deck
//         deck.createDeck ();
//         deck.shuffle ();

//         // Reset player hand
//         for ( let i = 0; i < playerHand.length; i++ ) {
//             scene.remove ( playerHand[i].cardMesh );
//         }
//         playerHand = [];

//         // Deal all cards
//         for ( let i = 0; i < 52; i++ ) {
//             deck.deal ( playerHand );

//             // Set card position randomly scattered across the table
//             playerHand[playerHand.length - 1].setPos ( Math.random () * 1.5 - 0.75, Math.random () * 1 - 0.5, Math.random () * 0.001 );

//             // Add card to scene
//             playerHand[playerHand.length - 1].addToScene ( scene );
//         }
//     }

//     // Reset the deck when 'r' is pressed
//     if ( event.key === 'r' ) {
//         deck.createDeck ();
//         deck.shuffle ();

//         // Reset player hand
//         for ( let i = 0; i < playerHand.length; i++ ) {
//             scene.remove ( playerHand[i].cardMesh );
//         }
//         playerHand = [];
//     }
// } );

var playerHand = [];
var opponentHand = [];
var miscCards = [];

///////////////////////////////// GAME LOGIC //////////////////////////////////
/*
Setup:
    - Create the deck and shuffle it
        - Remove all Aces from the deck
            - They will be placed back into the deck after 5 or so turns
                - To ensure that the player is the first person to get an Ace
    - Deal 5 cards to each player face down

Turns:
    - Player can right click on a card to inspect it privately
    - Player can left click on a card to play it
    - Once each player has played a card, the higher card wins
    - Winner gets to grab a card from the deck
Story:
    - When the player wins like 4 times, they will get an Ace
    - The player will then be able to play the Ace to win the game

                            ~~SPOILER~~
    The Ace is razor edged and will be used to kill the opponent
*/

/**
 *                                Events
 *  - PlayCard
 *      - Triggers when player card is clicked
 *  
 */

// Create the deck and shuffle it (remove all Aces)
const deck = new Deck ();
deck.setPos ( 0.5, 0, 0 );
deck.addToScene ( scene );

deck.shuffle ();

for ( let i = 0; i < 5; i++ ) {
    deck.deal ( miscCards, [ i, 'ace' ] );
}

// Handle mouse clicks
document.addEventListener ( 'mousedown', ( event ) => {
    // Get mouse position
    const mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera ( mouse, camera );

    // Intersects
    const intersects = raycaster.intersectObjects ( scene.children );

    // Left click
    if ( event.button === 0 ) {
        // If the player clicks on a card
        if ( intersects[0].object.name === 'card' ) {
            // If the card is in the player's hand
            for ( let i = 0; i < playerHand.length; i++ ) {
                if ( intersects[0].object.uuid === playerHand[i].cardMesh.uuid ) {
                    // Trigger PlayCard Event
                    if ( playerTurn ) document.dispatchEvent ( PlayerPlayCard );
                }
            }
        }
    }
} );

const animate = () => {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}
animate();
