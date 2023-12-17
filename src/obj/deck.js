import * as THREE from 'three';
import PlayingCard from './playing-card.js';

// Deck Class
export default class Deck {
    constructor () {
        // Publically accessible variables
        this.cards = [];
        
        // Deck's size
        this.maxSize = 0.1;
        
        // Deck Mesh
        this.deckGeometry = new THREE.BoxGeometry ( 0.0635, 0.0889, this.maxSize );
        this.deckMaterial = new THREE.MeshStandardMaterial ( { color: 0xffffff } );
        this.deckMesh = new THREE.Mesh ( this.deckGeometry, this.deckMaterial );
        this.deckMesh.name = 'deck';
        
        // Deck Position
        this.deckMesh.position.set ( 0.2, 0.1, 0 );
        
        // Create & Shuffle Deck
        this.createDeck ();
    }

    reset () {
        this.cards = [];
        this.deckMesh.scale.z = 1;
    }

    createDeck () {
        this.reset ();

        // Create Deck
        let cardName = '';
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

    // Deal Card to array (with optional card specification argument)
    deal ( array, card = null ) {
        if ( card === null ) {
            // If deck is empty, throw error
            if ( this.cards.length === 0 ) throw new Error ( 'Deck is empty' );

            // Deal card to array
            array.push ( this.cards.pop () );
        } else {
            let house = card[0];
            let value = card[1];

            for ( let i = 0; i < this.cards.length; i++ ) {
                if ( this.cards[i].suit === house && this.cards[i].value === value ) {
                    array.push ( this.cards.splice ( i, 1 )[0] );
                    break;
                }
            }

            // If card is not found, throw error
            if ( array[array.length - 1] === undefined ) throw new Error ( 'Card not found in deck' );
        }

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