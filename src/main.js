import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { GAME } from './game.js';

/* Render */

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
    - Player wins if the opponent has no cards left
        - Loses if the player has no cards left
    - If the player loses:
        - Ending is left ambiguous
    - When turn n is reached:
        - Player is given an Ace next victory
        - Ace can be used to kill the opponent
    - If the player wins before turn n:
        - Player's deck is replced with an Ace
        - Ace is used to kill the opponent
        

                            ~~SPOILER~~
    The Ace is razor edged and will be used to kill the opponent
*/

/**
 *                                Events
 *  - PlayCard
 *      - Triggers when player card is clicked
 *  
 */

const game = new GAME ( document );
game.initGame ();
game.render ();