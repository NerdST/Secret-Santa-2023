import * as THREE from 'three';

// Card Class
export default class PlayingCard {
    constructor ( suit, value ) {
        // Suit: 0 = Spades, 1 = Clubs, 2 = Hearts, 3 = Diamonds
        this.suit = suit;
        this.value = value;

        this.suitName = '';
        this.getSuitName ();

        // Card Texture
        const cardTextureName = 'res/PNG-cards-1.3/' + this.value + '_of_' + this.suitName + '.png';
        const cardTextureBackName = 'res/PNG-cards-1.3/back.png';

        // Card Mesh
        const cardGeometry = new THREE.PlaneGeometry ( 0.0635, 0.0889 );

        // Card Textures
        const cardTextureFront = new THREE.TextureLoader().load ( cardTextureName );

        const cardMaterial = new THREE.MeshBasicMaterial ( { map: cardTextureFront, side: THREE.DoubleSide } );

        this.cardMesh = new THREE.Mesh ( cardGeometry, cardMaterial );
        this.cardMesh.name = 'card';
    }

    // Get Suit Name
    getSuitName () {
        switch ( this.suit ) {
            case 0:
                this.suitName = 'spades';
                break;
            case 1:
                this.suitName = 'clubs';
                break;
            case 2:
                this.suitName = 'hearts';
                break;
            case 3:
                this.suitName = 'diamonds';
                break;
        };
    }

    setPos ( x, y, z ) {
        this.cardMesh.position.set ( x, y, z );
    }

    setRot ( x, y, z ) {
        this.cardMesh.rotation.set ( x, y, z );
    }

    addToScene ( scene ) {
        scene.add ( this.cardMesh );
    }
}