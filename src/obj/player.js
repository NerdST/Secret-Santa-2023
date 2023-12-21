import * as THREE from 'three';

// Player Class
export default class Player {
    constructor ( name ) {
        // Player Hand
        this.hand = new Array (5).fill ( null );
        this.name = name;
    }

    // Get a random card from hand
    getRandomCard () {
        let card = null;
        do {
            card = this.hand[Math.floor ( Math.random () * this.hand.length )];
        } while ( card === null );
        
        return card;
    }

    // Add a card to the first empty slot in hand
    addCard ( card, index = null ) {
        if ( index === null ) {
            this.hand[this.hand.indexOf ( null )] = card;
        } else {
            this.hand[index] = card;
        }
    }
}