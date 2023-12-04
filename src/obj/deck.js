import * as THREE from 'three';
import PlayingCard from './playing-card.js';

// Deck Class
export default class Deck {
    constructor () {
        this.cards = [];
        
        // Deck's size
        this.maxSize = 0.1;
        
        // Deck Mesh
        this.deckGeometry = new THREE.BoxGeometry ( 0.0635, 0.0889, this.maxSize );
        this.deckMaterial = new THREE.MeshStandardMaterial ( { color: 0xffffff } );
        this.deckMesh = new THREE.Mesh ( this.deckGeometry, this.deckMaterial );
        
        // Deck Position
        this.deckMesh.position.set ( 0.2, 0.1, 0 );
        
        // Create & Shuffle Deck
        this.createDeck ();
    }

    createDeck () {
        let cardName = '';
        this.cards = [];

        // Create Deck
        for ( let i = 0; i < 4; i++ ) {
            for ( let j = 0; j < 13; j++ ) {
                switch ( j ) {
                    case 0:
                        cardName = 'ace';
                        break;
                    case 10:
                        cardName = 'jack';
                        break;
                    case 11:
                        cardName = 'queen';
                        break;
                    case 12:
                        cardName = 'king';
                        break;
                    default:
                        cardName = j + 1;
                        break;
                }
                
                this.cards.push ( new PlayingCard ( i, cardName ) );
            }
        }

        this.updateDeckMesh ();
    }

    // Set the deck's position
    setPos ( x, y, z ) {
        this.deckMesh.position.set ( x, y, z );
    }

    // Shuffle Deck, Fisher-Yates Algorithm
    shuffle () {
        for ( let i = this.cards.length - 1; i > 0; i-- ) {
            const j = Math.floor ( Math.random () * ( i + 1 ) );
            [ this.cards[i], this.cards[j] ] = [ this.cards[j], this.cards[i] ];
        }
    }

    // Deal Card to Player [Player is an array]
    deal ( out ) {
        const card = this.cards.pop ();
        out.push ( card );
        this.updateDeckMesh ();
    }

    // Update the deck mesh based on the amount of cards left
    updateDeckMesh () {
        this.deckMesh.scale.z = this.cards.length / 52;
    }

    addToScene ( scene ) {
        scene.add ( this.deckMesh );
    }
}