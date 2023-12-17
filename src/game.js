import * as THREE from 'three';

export default class GAME {
    constructor () {
        // Global variables
        var gameState = 0; // 0 = Start Screen, 1 = Playing, 2 = End Screen ( Restart Menu )
        var mouseDown = false;

        // Game variables
        var deck;
        var player = new Player ();
        var opponent = new Opponent ();
        var discardPile = [];
        var intersects;
    }
    
    /* Initialize Event Listeners */
    init () {
        // Add event listener for mouse clicks
        document.addEventListener ( 'mousedown', ( event ) => { this.mouseClick ( event ); } );
        document.addEventListener ( 'mouseup', ( event ) => { this.mouseUp ( event ); } );
    }

    /* Mouse Click Event */
    mouseClick ( event ) {
        // If the game is in the playing state
        if ( gameState == 1 ) {
            // Get mouse position
            var mouse = new THREE.Vector2();
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            
            // Get objects intersected by mouse
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera ( mouse, camera );
            intersects = raycaster.intersectObjects ( scene.children );
        }

        mouseDown = true;
    }

    /* Mouse Up Event */
    mouseUp ( event ) {
        mouseDown = false;
    }

    /* Delete all objects in the scene */
    deleteTable () {
        // Remove all cards and deck from the scene
        for ( let i = 0; i < scene.children.length; i++ ) {
            if ( scene.children[i].name == 'card' ) {
                scene.remove ( scene.children[i] );
            }
            
            if ( scene.children[i].name == 'deck' ) {
                scene.remove ( scene.children[i] );
            }
        }

        // Remove all instances of cards from arrays
        discardPile = [];
    }

    /* Start Game */
    startGame () {
        
        // Delete all objects in the scene
        this.deleteTable ();
        
        // Create the deck and shuffle it
        deck = new Deck ();
        deck.setPos ( 0.5, 0, 0 );
        deck.addToScene ( scene );
        deck.shuffle ();
        
        // Deal cards to the players
        for ( let i = 0; i < 5; i++ ) {
            deck.deal ( playerHand );
            deck.deal ( opponentHand );
        }
        
        // Deal the first card to the discard pile
        deck.deal ( discardPile );
        
        // Set the game state to playing
        gameState = 1;
    }
}

// Function to move cards between arrays
function moveCard ( card, array1, array2 ) {
    // Remove card from array1 and add it to array2
    for ( let i = 0; i < array1.length; i++ ) {
        if ( card.uuid == array1[i].cardMesh.uuid ) {
            array2.push ( array1.splice ( i, 1 )[0] );
        }
    }
}