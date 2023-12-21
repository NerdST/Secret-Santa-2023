import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Player from './obj/player.js';
import Deck from './obj/deck.js';
import PlayingCard from './obj/playing-card.js';

//TODO: FIX THE FUCKING CODE

export class GAME {
    constructor ( document ) {
        // Global variables
        this.gameState = 0; // 0 = Start Screen, 1 = Playing, 2 = End Screen ( Restart Menu )
        this.mouseDown = false;
        this.playState = 0; // 0 = No one, 1 = Player, 2 = Opponent, 3 = Determine Winner
        this.playerPlayedCard = new Array ( 5 ).fill ( null );
        this.opponentPlayedCard = new Array ( 5 ).fill ( null );

        // Game variables
        this.deck;
        this.player = new Player ( "Player" );
        this.opponent = new Player ( "Opponent" );
        this.discardPile = [];
        this.aceTempDeck = [];
        this.turn = 0;
        this.aceTurn = 4;   // The turn the aces come out

        this.intersects;
        this.clock = new THREE.Clock ();
        this.deltaTime = 0;

        //--------------------------------------------------------------------------------//

        // Canvas
        this.canvas = document.querySelector ( '#webgl' );

        // Scene
        this.scene = new THREE.Scene ();

        // Camera
        this.camera = new THREE.PerspectiveCamera ( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        // Controls
        this.controls = new OrbitControls ( this.camera, this.canvas );
        this.controls.enableDamping = true;

        // Renderer
        this.renderer = new THREE.WebGLRenderer ( {
            canvas: this.canvas
        } );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize ( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio ( window.devicePixelRatio );

        // Resize
        window.addEventListener ( 'resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        } );

        // Add Tabletop
        const tabletopPlane = new THREE.PlaneGeometry ( 1.5, 1 );
        const tabletopTexture = new THREE.TextureLoader().load ( 'res/table-texture.jpg' );
        tabletopTexture.wrapS = THREE.RepeatWrapping;
        tabletopTexture.wrapT = THREE.RepeatWrapping;
        tabletopTexture.repeat.set ( 2, 1 );
        const tabletopMaterial = new THREE.MeshBasicMaterial ( { map: tabletopTexture } );
        this.tabletop = new THREE.Mesh ( tabletopPlane, tabletopMaterial);
        this.tabletop.position.set ( 0, 0, -0.0001 );
        this.tabletop.receiveShadow = true;
        this.scene.add ( this.tabletop );

        // Light
        const light = new THREE.PointLight ( 0xffffff, 1, 100 );
        light.position.set ( 0, 0.5, 1 );
        light.castShadow = true;
        this.scene.add ( light );

        // Position camera
        this.camera.position.z = 1;

        // Initialize Event Listeners
        this.initEvents ();
    }
    
    /* Initialize Event Listeners */
    initEvents () {
        // Add event listener for mouse clicks
        window.addEventListener ( 'mousedown', ( event ) => { this.mouseClick ( event ); } );
        window.addEventListener ( 'mouseup', ( event ) => { this.mouseUp ( event ); } );
    }

    /* Mouse Click Event */
    mouseClick ( event ) {
        // If the game is in the playing state
        if ( this.gameState == 1 ) {
            // Get mouse position
            let mouse = new THREE.Vector2();
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            
            // Get objects intersected by mouse
            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera ( mouse, this.camera );
            this.intersects = raycaster.intersectObjects ( this.scene.children );
        }

        this.mouseDown = true;
    }

    /* Mouse Up Event */
    mouseUp ( event ) {
        this.mouseDown = false;
    }

    /* Delete all objects in the scene */
    deleteTable () {
        // Remove all cards and deck from the scene
        for ( let i = 0; i < this.scene.children.length; i++ ) {
            if ( this.scene.children[i].name == 'card' ) {
                this.scene.remove ( this.scene.children[i] );
            }
            
            if ( this.scene.children[i].name == 'deck' ) {
                this.scene.remove ( this.scene.children[i] );
            }
        }

        // Remove all instances of cards from arrays
        this.discardPile = [];
        this.player.hand = new Array ( 5 ).fill ( null );
        this.opponent.hand = new Array ( 5 ).fill ( null );
        this.playerPlayedCard = new Array ( 5 ).fill ( null );
        this.opponentPlayedCard = new Array ( 5 ).fill ( null );
    }

    initGame () {
        // Delete all objects in the scene
        this.deleteTable ();
        
        // Create the deck and shuffle it
        this.deck = new Deck ();
        this.deck.setPos ( 0.5, 0, 0 );
        this.deck.addToScene ( this.scene );
        this.deck.shuffle ();

        // Remove all Aces from the deck
        for ( let i = 0; i < this.deck.cards.length; i++ ) {
            if ( this.deck.cards[i].value == 'ace' ) {
                this.aceTempDeck.push ( this.deck.cards[i] );
                this.deck.cards.splice ( i, 1 );
                i--;
            }
        }
        
        // Deal cards to the players ( and add them to the scene )
        for ( let i = 0; i < 5; i++ ) {            
            this.deck.deal ( this.player.hand, null, this.player );
            this.deck.deal ( this.opponent.hand, null, this.opponent );

            this.player.hand[i].cardMesh.userData.owner = this.player;
            this.opponent.hand[i].cardMesh.userData.owner = this.opponent;

            this.player.hand[i].setPos ( -0.5 + ( i * 0.1 ), -0.3, 0.001 );
            this.opponent.hand[i].setPos ( -0.5 + ( i * 0.1 ), 0.3, 0.001 );
            
            this.player.hand[i].addToScene ( this.scene );
            this.opponent.hand[i].addToScene ( this.scene );
        }
        
        // Deal the first card to the discard pile
        this.deck.deal ( this.discardPile );
        
        // Set the game state to playing
        this.gameState = 1;
        this.playState = 1;
    }

    /* Update the game */
    update () {
        // Get delta time
        this.deltaTime = this.clock.getDelta ();

        if ( this.gameState == 1 ) {
            // Player's turn
            if ( this.playState == 1 ) {
                if ( this.mouseDown ) {
                    this.mouseDown = false;

                    if ( this.intersects[0].object.name == 'card' && this.intersects[0].object.userData.owner == this.player ) {
                        let clickedCard = this.intersects[0].object.userData.parent;
                        let clickedCardIndex = this.player.hand.indexOf ( clickedCard );

                        // Play the card
                        this.playerPlayedCard[clickedCardIndex] = clickedCard;
                        this.player.hand[clickedCardIndex] = null;

                        // Set the card's position
                        this.playerPlayedCard[clickedCardIndex].setPos ( this.playerPlayedCard[clickedCardIndex].cardMesh.position.x,
                                                                         this.playerPlayedCard[clickedCardIndex].cardMesh.position.y + 0.03,
                                                                         0.001 );
                        

                        console.log ( "Player played card: " + this.playerPlayedCard[clickedCardIndex].value + " of " + this.playerPlayedCard[clickedCardIndex].suitName )

                        // End the player's turn
                        this.playState = 2;
                    }
                }
            } else if ( this.playState == 2 ) {
                // Opponent's turn
                let cardPlayed = this.opponent.getRandomCard ();
                let cardPlayedIndex = this.opponent.hand.indexOf ( cardPlayed );
                
                // Remove card from hand and add it to the played cards
                this.opponentPlayedCard[cardPlayedIndex] = cardPlayed;
                this.opponent.hand[cardPlayedIndex] = null;

                this.opponentPlayedCard[cardPlayedIndex].setPos ( this.opponentPlayedCard[cardPlayedIndex].cardMesh.position.x,
                                                                  this.opponentPlayedCard[cardPlayedIndex].cardMesh.position.y - 0.03,
                                                                  0.001 );
                
                console.log ( "Opponent played card: " + this.opponentPlayedCard[cardPlayedIndex].value + " of " + this.opponentPlayedCard[cardPlayedIndex].suitName )
                
                // End the opponent's turn
                this.playState = 3;
            } else if ( this.playState == 3 ) {
                // Compare cards and determine winner
                let winner = 0; // 0 = Tie, 1 = Player, 2 = Opponent

                // Get index of played and opponent cards
                let pIndex = 0;
                while ( this.playerPlayedCard[pIndex] === null ) {
                    pIndex++;
                }

                let oIndex = 0;
                while ( this.opponentPlayedCard[oIndex] === null ) {
                    oIndex++;
                }
                
                // Output the cards played
                if ( this.playerPlayedCard[pIndex].valueWeight > this.opponentPlayedCard[oIndex].valueWeight ) {
                    // Player wins
                    winner = 1;
                    console.log ( "Player wins" );
                } else if ( this.playerPlayedCard[pIndex].valueWeight < this.opponentPlayedCard[oIndex].valueWeight ) {
                    // Opponent wins
                    winner = 2;
                    console.log ( "Opponent wins" );
                }
                ////////////////////////// Delete later
                else {
                    // Tie
                    console.log ( "Tie" );
                }
                //////////////////////////////////////

                // Discard cards
                this.playerPlayedCard[pIndex].cardMesh.userData.parent = null;
                this.opponentPlayedCard[oIndex].cardMesh.userData.parent = null;
                this.scene.remove ( this.playerPlayedCard[pIndex].cardMesh );
                this.scene.remove ( this.opponentPlayedCard[oIndex].cardMesh );
                this.discardPile.push ( this.playerPlayedCard[pIndex] );
                this.discardPile.push ( this.opponentPlayedCard[oIndex] );
                this.playerPlayedCard[pIndex] = null;
                this.opponentPlayedCard[oIndex] = null;

                // Deal card to winner
                if ( winner == 1 ) {
                    // If the ace turn has been reached, give the player an ace
                    if ( this.turn >= this.aceTurn ) {
                        console.log ( "eating a burger with no honey mustard" );
                        this.player.addCard ( this.aceTempDeck.pop (), pIndex );
                    } else {
                        this.deck.deal ( this.player.hand, null, this.player, pIndex );
                    }

                    this.player.hand[pIndex].cardMesh.userData.owner = this.player;
                    this.player.hand[pIndex].setPos ( -0.5 + ( pIndex * 0.1 ), -0.3, 0.001 );
                    this.player.hand[pIndex].addToScene ( this.scene );
                } else if ( winner == 2 ) {
                    this.deck.deal ( this.opponent.hand, null, this.opponent, oIndex );
                    this.opponent.hand[oIndex].cardMesh.userData.owner = this.opponent;
                    this.opponent.hand[oIndex].setPos ( -0.5 + ( oIndex * 0.1 ), 0.3, 0.001 );
                    this.opponent.hand[oIndex].addToScene ( this.scene );
                } else {
                    // Tie
                    this.deck.deal ( this.player.hand, null, this.player, pIndex );
                    this.deck.deal ( this.opponent.hand, null, this.opponent, oIndex );
                    this.player.hand[pIndex].cardMesh.userData.owner = this.player;
                    this.opponent.hand[oIndex].cardMesh.userData.owner = this.opponent;
                    this.player.hand[pIndex].setPos ( -0.5 + ( pIndex * 0.1 ), -0.3, 0.001 );
                    this.opponent.hand[oIndex].setPos ( -0.5 + ( oIndex * 0.1 ), 0.3, 0.001 );
                    this.player.hand[pIndex].addToScene ( this.scene );
                    this.opponent.hand[oIndex].addToScene ( this.scene );
                }

                // Add to turn counter
                this.turn++;

                // Set the turn to the player
                this.playState = 1;
            }            
        }
    }

    /* Render the scene */
    render () {
        requestAnimationFrame ( () => { this.render (); } );
        
        // Update controls
        this.controls.update ();

        // Update game loop
        this.update ();

        this.renderer.render ( this.scene, this.camera );
    }
}

// Function to move cards between arrays
function moveCard ( card, arrayIn, arrayOut ) {
    // Remove card from array1 and add it to array2
    arrayOut.push ( arrayIn.splice ( arrayIn.indexOf ( card ), 1 )[0] );
}